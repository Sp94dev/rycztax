# Dokument Wymagań Projektowych (PRD): Rycztax (MVP)

- **Produkt:** Rycztax (Minimum Viable Product)
- **Wersja:** 1.2
- **Data:** 30 czerwca 2025

---

## 1. Wprowadzenie i Cel

### 1.1. Tło

Freelancerzy oraz właściciele mikro-firm w Polsce na co dzień borykają się z obowiązkiem skrupulatnego dokumentowania kosztów. Proces ten jest w dużej mierze manualny, co pochłania cenny czas, który mógłby być przeznaczony na rozwój biznesu i pracę z klientami.

### 1.2. Problem

Obecny proces obsługi faktur kosztowych jest czasochłonny, podatny na błędy i frustrujący. Użytkownik musi ręcznie zrobić zdjęcie lub skan dokumentu, przekonwertować go do odpowiedniego formatu, wymyślić i nadać mu poprawną nazwę, a następnie skatalogować go w odpowiednim folderze. Na koniec każdego okresu rozliczeniowego musi odnaleźć wszystkie dokumenty, spakować je i wysłać do księgowości, co generuje dodatkowy stres i ryzyko pominięcia któregoś z kosztów.

### 1.3. Rozwiązanie / Wizja

Rycztax to Progresywna Aplikacja Webowa (PWA), która rewolucjonizuje proces zarządzania fakturami kosztowymi. Wizją produktu jest całkowita automatyzacja nudnych i powtarzalnych czynności. Rycztax ma być inteligentnym asystentem, który po zrobieniu zdjęcia faktury, przy użyciu zaawansowanego modelu językowego (LLM), rozumie jej treść, automatycznie odczytuje wszystkie kluczowe dane, nazywa plik, a następnie bezpiecznie przechowuje dokument i ułatwia jego udostępnianie księgowości.

---

## 2. Persony Użytkowników

### 2.1. Anna, Freelancerka Graficzna

- **Kim jest:** Projektantka graficzna na samozatrudnieniu (B2B), bardzo zajęta pracą kreatywną i kontaktem z klientami.
- **Cele:** Chce maksymalnie uprościć wszystkie czynności administracyjne, aby móc skupić się na tym, co przynosi jej dochód i satysfakcję.
- **Frustracje:** Paragony i faktury za oprogramowanie czy sprzęt często giną jej w torbie lub cyfrowym chaosie. Stresuje ją comiesięczny obowiązek zbierania "wszystkiego do kupy" dla księgowej.
- **Potrzeba:** _"Potrzebuję super prostego sposobu, żeby zrobić zdjęcie faktury od razu jak ją dostanę i o niej zapomnieć, z pewnością, że trafi tam, gdzie powinna."_

### 2.2. Marek, Właściciel Mikro-firmy Budowlanej

- **Kim jest:** Prowadzi małą, 3-osobową firmę. Często jest w terenie, a faktury za paliwo, narzędzia i materiały zbiera w samochodzie.
- **Cele:** Chce mieć porządek w dokumentach kosztowych, aby lepiej kontrolować finanse firmy i unikać problemów z Urzędem Skarbowym.
- **Frustracje:** Ręczne opisywanie segregatorów i faktur to dla niego strata czasu. Często ma problem z szybkim odnalezieniem konkretnego dokumentu sprzed kilku miesięcy.
- **Potrzeba:** _"Chcę mieć wszystkie faktury kosztowe w jednym miejscu online, dobrze opisane i gotowe do wysłania księgowej jednym kliknięciem, bez przekopywania się przez stosy papierów."_

---

## 3. Funkcjonalności i User Stories

### 3.1. Uwierzytelnianie Użytkownika

- **Opis:** Bezpieczny system rejestracji i logowania.
- **User Story:** "Jako użytkownik, chcę móc założyć konto i bezpiecznie się logować, aby chronić dostęp do moich wrażliwych dokumentów finansowych."

### 3.2. Przesyłanie i Przetwarzanie Dokumentu

- **Opis:** Możliwość dodania dokumentu poprzez zrobienie zdjęcia (PWA mobile) lub wgranie pliku (desktop). System automatycznie kadruje zdjęcie i konwertuje je do formatu PDF.
- **User Story:** "Jako Anna, chcę móc zrobić zdjęcie faktury telefonem zaraz po spotkaniu z klientem, aby natychmiast dodać ją do systemu i nie martwić się o papierowy oryginał."

### 3.3. Automatyczna Ekstrakcja Danych i Nazywanie Pliku

- **Opis:** System wysyła obraz dokumentu do modelu LLM z precyzyjnym zapytaniem (prompt) o ekstrakcję zdefiniowanego zestawu danych. Na podstawie odpowiedzi AI, system zapisuje dane w bazie i automatycznie generuje nazwę pliku.
- **Odczytywane Dane:** Nazwa wystawcy, NIP wystawcy, Data wystawienia, Termin płatności, Numer faktury, Kwota Netto, Kwota Brutto, Stawki i kwoty VAT.
- **User Story:** "Jako Marek, chcę, aby po wgraniu zdjęcia faktury system sam zrozumiał kto jest wystawcą, jaka jest data i kwota, zapisał te informacje i nadał plikowi zrozumiałą nazwę, abym ja nie musiał wprowadzać ani jednej danej ręcznie."
- **Logika Nazewnictwa:**
  1.  Format docelowy: `RRRR-MM-DD_NIP-WYSTAWCY_NR-FAKTURY.pdf`
  2.  Logika awaryjna: W przypadku braku numeru faktury, system stosuje format `RRRR-MM-DD_NIP-WYSTAWCY_X.pdf`, gdzie X to kolejny numer porządkowy dla danego wystawcy w danym dniu.

### 3.4. Weryfikacja Danych przez Użytkownika

- **Opis:** Jeśli system ma niską pewność co do poprawności odczytanych danych, oznacza dokument jako "Wymaga weryfikacji". Użytkownik może w prostym oknie modalnym poprawić lub uzupełnić dane.
- **User Story:** "Jako użytkownik, chcę być wyraźnie poinformowany, jeśli system nie jest pewien odczytanych danych, i mieć możliwość ich prostej korekty w jednym okienku, aby zapewnić 100% poprawność informacji bez zbędnego wysiłku."

### 3.5. Przeglądanie i Zarządzanie Dokumentami

- **Opis:** Przejrzysta lista wszystkich dokumentów z widocznym statusem (`Przetwarzany`, `Wymaga weryfikacji`, `Zaakceptowany`), datą i nazwą. Możliwość podstawowego sortowania i filtrowania.
- **User Story:** "Jako Marek, chcę mieć przejrzystą listę wszystkich moich kosztów z ostatniego miesiąca, abym mógł na bieżąco kontrolować porządek w dokumentach."

### 3.6. Eksport Miesięczny

- **Opis:** Funkcja pozwalająca wybrać miesiąc i pobrać jedną, spakowaną paczkę `.zip` ze wszystkimi zaakceptowanymi dokumentami z tego okresu.
- **User Story:** "Jako Anna, chcę na początku miesiąca móc w dwóch kliknięciach pobrać paczkę ze wszystkimi fakturami z poprzedniego miesiąca, aby szybko i sprawnie wysłać ją mailem do mojej księgowej."

---

## 4. Wymagania Niefunkcjonalne

- **Wydajność:** Aplikacja musi działać szybko. Czas od przesłania dokumentu do jego pojawienia się na liście w stanie "Zaakceptowany" powinien być możliwie jak najkrótszy, z celem poniżej 45 sekund. Czas ten jest uzależniony od czasu odpowiedzi zewnętrznego API modelu LLM i przetwarzanie powinno odbywać się asynchronicznie w tle.
- **Bezpieczeństwo i Prywatność Danych:** Dane będą zabezpieczone z wykorzystaniem standardów platformy BaaS. Kluczowe jest zapewnienie prywatności danych przesyłanych do modelu LLM. Należy wybrać dostawcę, który gwarantuje, że dane klientów nie są wykorzystywane do trenowania jego modeli (polityka "zero data retention") oraz poinformować o tym użytkownika w regulaminie.
- **Architektura:** Architektura systemu musi zapewniać luźne powiązanie (loose coupling) między warstwą frontendową a backendową. Komunikacja odbywa się poprzez dobrze zdefiniowane API. Umożliwi to w przyszłości elastyczną wymianę lub rozbudowę poszczególnych komponentów (np. dodanie natywnej aplikacji mobilnej) bez konieczności przebudowy całego systemu.
- **Dostępność:** Aplikacja musi być w pełni funkcjonalna na najnowszych wersjach popularnych przeglądarek (Chrome, Safari, Firefox) na urządzeniach desktopowych i mobilnych.

---

## 5. Założenia i Ryzyka

- **Założenia:**
  - Dostępne na rynku modele LLM (np. GPT-4o, Gemini API) są w stanie z wysoką skutecznością (>95%) i w akceptowalnym czasie analizować obrazy faktur i zwracać ustrukturyzowane dane.
  - Użytkownicy akceptują fakt, że ich dokumenty są przetwarzane przez zewnętrznego, zaufanego dostawcę AI w celu ekstrakcji danych, pod warunkiem zapewnienia poufności.
- **Ryzyka:**
  - **Ryzyko Wysokie: Koszty Operacyjne.** Każde przetworzenie faktury wiąże się z kosztem zapytania do API LLM. Przy dużej liczbie dokumentów może to uczynić model biznesowy (szczególnie darmowy plan) nieopłacalnym.
    - _Plan mitygacji:_ Dokładna analiza cenników API. Wybór modelu oferującego najlepszy stosunek ceny do jakości. Zaplanowanie przyszłego modelu cenowego dla użytkowników przekraczających określony limit dokumentów.
  - **Ryzyko Wysokie: Prywatność Danych (RODO/GDPR).** Przesyłanie wrażliwych danych finansowych do zewnętrznego dostawcy LLM stwarza ryzyko regulacyjne i utraty zaufania użytkowników.
    - _Plan mitygacji:_ Wybór wyłącznie dostawców z jasno zdefiniowaną polityką prywatności i opcją "zero data retention". Jawne i transparentne informowanie użytkowników o procesie w regulaminie usługi.
  - **Ryzyko Średnie: Czas Odpowiedzi API (Latency).** Czas odpowiedzi modelu LLM może być zmienny, co może negatywnie wpłynąć na postrzeganą szybkość aplikacji.
    - _Plan mitygacji:_ Implementacja przetwarzania dokumentów w tle (asynchronicznie). Użytkownik od razu widzi plik na liście ze statusem "Przetwarzany", a dane pojawiają się po zakończeniu analizy przez AI.

---

## 6. Kryteria Sukcesu i KPI

- **Cel Biznesowy 1: Maksymalna, inteligentna automatyzacja i oszczędność czasu.**
  - **KPI 1:** Średni czas od zrobienia zdjęcia do pojawienia się w pełni przetworzonego dokumentu na liście **poniżej 45 sekund**.
  - **KPI 2 (Poziom automatyzacji):** Minimum **90%** wgranych dokumentów jest w pełni i poprawnie przetwarzanych (wszystkie zdefiniowane pola) bez potrzeby ręcznej interwencji użytkownika.
- **Cel Biznesowy 2: Prostota i dostarczenie wysokiej wartości.**
  - **KPI 3 (Task Completion Rate):** Wskaźnik ukończenia zadania dla kluczowej ścieżki "pobierz paczkę za dany miesiąc" **powyżej 95%**.
  - **KPI 4 (Retencja):** Wskaźnik retencji użytkowników po pierwszym miesiącu użytkowania **powyżej 40%**.

---

## 7. Zakres Negatywny (Co jest poza zakresem MVP)

Aby zapewnić szybkie wdrożenie i skupienie na kluczowej wartości, następujące funkcje **NIE ZOSTANĄ** zaimplementowane w wersji MVP:

- Aktywne wykrywanie i blokowanie duplikatów dokumentów.
- Możliwość generowania nowych faktur sprzedaży.
- Obliczanie podatków i przygotowywanie danych do plików JPK.
- Funkcja automatycznego wysyłania paczek z dokumentami na adres e-mail księgowości z poziomu aplikacji.
- Zaawansowane raporty, analizy i diagramy kosztów.
