
# Zadania do Wykonania - Usprawnienia Rycztax MVP

Ten dokument opisuje zadania niezbędne do naprawy i ukończenia kluczowych funkcjonalności aplikacji Rycztax, zgodnie z przeprowadzoną analizą kodu.

---

### ✅ Task 1: Poprawa logiki zmiany nazwy plików w funkcji `processFile`

**Problem:**
Obecna logika w `packages/firebase/functions/src/features/process-file/process-file.ts` nieprawidłowo generuje nową nazwę pliku. Używa myślników w dacie, niepoprawnie obsługuje znaki specjalne i nie jest zgodna z docelowym formatem zdefiniowanym w wymaganiach.

**Proponowane rozwiązanie:**
Należy zmodyfikować fragment kodu odpowiedzialny za tworzenie `newFileName`, aby zapewnić zgodność z formatem `RRRR-MM-DD_NIP-WYSTAWCY_NR-FAKTURY.rozszerzenie`.

**Szczegóły implementacji:**

1.  **Formatowanie daty:** Upewnij się, że data `invoice_date` jest zawsze w formacie `RRRR-MM-DD`.
2.  **Czyszczenie numeru faktury:** Usuń wszystkie znaki specjalne z `document_number` i zastąp je podkreślnikiem (`_`).
3.  **Składanie nazwy:** Połącz wszystkie części, używając podkreślników jako separatorów, a nie myślników (poza datą).

**Przykład poprawionego kodu:**

```typescript
// Stara, niepoprawna logika:
// const invoice_date: string = extractedData['extractedData'].replace('-', '_');
// const newFileName = `${seller_tax_id || 'BRAK_NIP'}-${invoice_date || 'BRAK_DATY'}-${safeDocNumber}.${extension}`.replace('/', '_');

// Nowa, poprawna logika:
const { seller_tax_id, document_number, invoice_date } = extractedData as any;

// 1. Upewnij się, że data jest w formacie YYYY-MM-DD
const formattedDate = invoice_date || 'BRAK_DATY';

// 2. Wyczyść NIP i numer faktury
const safeTaxId = (seller_tax_id || 'BRAK_NIP').replace(/[^a-zA-Z0-9]/g, '');
const safeDocNumber = (document_number || 'BRAK_NUMERU').replace(/[^a-zA-Z0-9-]/g, '_');

// 3. Złóż nową nazwę pliku zgodnie ze standardem
const newFileName = `${formattedDate}_${safeTaxId}_${safeDocNumber}.${extension}`;

const destinationPath = `users/${userId}/processed/${newFileName}`;
await file.move(destinationPath);
```

---

### ✅ Task 2: Wprowadzenie zaawansowanej obsługi błędów w `processFile`

**Problem:**
Gdy model AI nie zwróci poprawnych danych lub wystąpi inny błąd, plik pozostaje w folderze `uploads` bez żadnej informacji o przyczynie niepowodzenia. To utrudnia diagnozę i ponowne przetworzenie.

**Proponowane rozwiązanie:**
Należy stworzyć mechanizm, który w przypadku błędu przeniesie plik do dedykowanego folderu `failed` i zapisze szczegóły błędu w Firestore.

**Szczegóły implementacji:**

1.  **Stworzenie ścieżki dla nieudanych plików:**
    *   W przypadku błędu (np. błąd parsowania JSON, brak odpowiedzi z AI), przenieś plik z `uploads` do `users/{userId}/failed/{original_file_name}`.
2.  **Logowanie błędu w Firestore:**
    *   W kolekcji `users/{userId}/invoices` (lub dedykowanej kolekcji `failures`) utwórz nowy dokument.
    *   Zapisz w nim status `failed`, oryginalną nazwę pliku, znacznik czasu oraz treść błędu (`error.message`).

**Przykład struktury `try...catch`:**

```typescript
try {
  // ... cała logika przetwarzania pliku ...
} catch (error) {
  logger.error('Błąd podczas przetwarzania pliku:', error);

  // Przenieś plik do folderu /failed
  const originalFileName = event.data.name.split('/').pop();
  const failedPath = `users/${userId}/failed/${originalFileName}`;
  await file.move(failedPath);

  // Zapisz informacje o błędzie w Firestore
  const db = getFirestore();
  await db.collection('users').doc(userId).collection('invoices').add({
    status: 'failed',
    originalFilePath: event.data.name,
    failedFilePath: failedPath,
    error: (error as Error).message,
    processedAt: new Date().toISOString(),
  });
}
```

---

### ✅ Task 3: Poprawa logiki pobierania danych na frontendzie

**Problem:**
Komponent `FilesPageComponent` (`packages/app/src/app/features/files/pages/files.page.component.ts`) odpytuje główną kolekcję `invoices`, podczas gdy backend zapisuje dane w subkolekcji `users/{userId}/invoices`. W rezultacie użytkownik nie widzi swoich plików.

**Proponowane rozwiązanie:**
Należy zmodyfikować zapytanie do Firestore w konstruktorze komponentu, aby pobierało dane z właściwej, specyficznej dla użytkownika ścieżki.

**Szczegóły implementacji:**

1.  **Pobranie ID użytkownika:** Użyj `AuthService`, aby uzyskać `userId`.
2.  **Dynamiczne tworzenie ścieżki:** Zbuduj ścieżkę do subkolekcji, np. `users/${userId}/invoices`.
3.  **Obsługa braku użytkownika:** Upewnij się, że zapytanie jest wysyłane dopiero po uzyskaniu `userId`.

**Przykład poprawionego kodu:**

```typescript
// Stara, niepoprawna logika:
// constructor() {
//   const invoiceCollection = collection(this.firestore, 'invoices');
//   this.invoices$ = collectionData(invoiceCollection);
// }

// Nowa, poprawna logika:
constructor() {
  this.invoices$ = this.authService.user.pipe(
    switchMap(user => {
      if (user) {
        const invoiceCollection = collection(this.firestore, `users/${user.uid}/invoices`);
        return collectionData(invoiceCollection, { idField: 'id' }); // Użyj idField, aby mieć ID dokumentu
      } else {
        return of([]); // Zwróć pustą tablicę, jeśli użytkownik nie jest zalogowany
      }
    })
  );
}
```
