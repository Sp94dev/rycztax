# Aplikacja - Rycztax (MVP)

### Główny problem

Przedsiębiorcy i freelancerzy tracą czas i pieniądze z powodu chaotycznego zarządzania fakturami kosztowymi. Dokumenty
giną na dyskach twardych lub w formie papierowej, a ich ręczne katalogowanie i przygotowywanie do wysyłki dla
księgowości jest czasochłonne, podatne na błędy i stresujące.

### Rozwiązanie

Rycztax to aplikacja webowa, która automatyzuje proces zbierania i archiwizowania faktur. Użytkownik wgrywa plik z
dokumentem przez prosty interfejs. System, wykorzystując agenta AI (LLM), automatycznie odczytuje kluczowe dane, nadaje
plikowi ustandaryzowaną nazwę i bezpiecznie przechowuje go w chmurze.

### Najmniejszy zestaw funkcjonalności

- **Logowanie i Rejestracja:** Bezpieczne uwierzytelnianie użytkownika.
- **Wgrywanie dokumentów przez interfejs webowy:**
    - Wgranie pliku z dysku.
    - Zrobienie zdjęcia dokumentu (na urządzeniach mobilnych).
- **Automatyczne przetwarzanie dokumentów:**
    - Ekstrakcja kluczowych danych (NIP, data, numer, kwoty) za pomocą agenta AI (model Gemini).
    - Zapisanie odczytanych danych w bazie danych Firestore.
    - Automatyczne nadanie nazwy plikowi i zapisanie go w storage.
- **Standaryzacja nazwy pliku:**
    - Format główny: `RRRR-MM-DD_NIP-WYSTAWCY_NR-FAKTURY.oryginalneRozszerzenie`
    - Logika awaryjna (przykłady):
        - `RRRR-MM-DD_RECEIPT_KWOTA-BRUTTO.oryginalneRozszerzenie` (dla paragonów)
        - `RRRR-MM-DD_NIP-WYSTAWCY_NO-NUMBER_HASH.oryginalneRozszerzenie` (dla dokumentów bez numeru)
- **Przeglądanie dokumentów:**
    - Prosta, chronologiczna lista wszystkich wgranych dokumentów.
    - Możliwość podglądu oryginalnego pliku.
- **Eksport dla księgowości:**
    - Funkcja pobierania paczki `.zip` ze wszystkimi dokumentami z wybranego miesiąca.

### Co NIE wchodzi w zakres MVP

- **Wgrywanie dokumentów przez dedykowany adres e-mail.**
- Ręczna weryfikacja i edycja danych przez użytkownika w interfejsie.
- Udostępnianie dokumentów za pomocą "Magicznego Linku".
- Tworzenie zaawansowanych raportów, analiz i diagramów.
- Wieloagentowa weryfikacja poprawności danych przez AI.
- Generowanie plików JPK.
- Zaawansowane tagowanie i kategoryzacja kosztów.