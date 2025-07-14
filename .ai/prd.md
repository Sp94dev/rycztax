# Dokument Wymagań Projektowych (PRD): Rycztax

- **Produkt:** Rycztax (Minimum Viable Product)
- **Wersja:** 2.1
- **Data:** 4 lipca 2024

---

## 1. Wprowadzenie i Cel

### 1.1. Tło

Freelancerzy oraz właściciele mikro-firm w Polsce na co dzień borykają się z obowiązkiem skrupulatnego dokumentowania
kosztów. Proces ten jest w dużej mierze manualny i rozproszony – faktury spływają mailowo, są wręczane w formie
papierowej, co prowadzi do chaosu i strat finansowych.

### 1.2. Problem

Obecny proces obsługi faktur kosztowych jest nieefektywny i frustrujący. Użytkownik musi pamiętać o zapisaniu załącznika
z maila, zrobieniu zdjęcia paragonu, a następnie ręcznym nazwaniu i skatalogowaniu plików. Na koniec miesiąca musi
odnaleźć wszystkie dokumenty, spakować je i wysłać do księgowości, co generuje stres i ryzyko pominięcia kosztów.

### 1.3. Rozwiązanie / Wizja

Rycztax to inteligentny asystent do zarządzania fakturami kosztowymi, działający jako Progresywna Aplikacja Webowa (
PWA). Wizją produktu jest stworzenie **jednego, centralnego miejsca** na wszystkie dokumenty kosztowe. Po wgraniu
dokumentu przez aplikację, system, przy użyciu agenta AI (LLM), automatycznie odczytuje dane, nazywa plik, bezpiecznie
go przechowuje i ułatwia przekazanie kompletu dokumentów księgowości.

---

## 2. Persony Użytkowników

### 2.1. Anna, Freelancerka Graficzna

- **Kim jest:** Projektantka graficzna na samozatrudnieniu (B2B), bardzo zajęta pracą kreatywną i kontaktem z klientami.
- **Cele:** Chce maksymalnie uprościć wszystkie czynności administracyjne, aby móc skupić się na tym, co przynosi jej
  dochód i satysfakcję.
- **Frustracje:** Faktury za oprogramowanie i usługi online w formacie PDF oraz skany papierowych dokumentów tworzą
  chaos na jej pulpicie i w folderze "Pobrane".
- **Potrzeba:** _"Potrzebuję jednego miejsca, gdzie mogę szybko wrzucić wszystkie faktury z mojego komputera i o nich
  zapomnieć, z pewnością, że są bezpieczne i dobrze zorganizowane."_

### 2.2. Marek, Właściciel Mikro-firmy Budowlanej

- **Kim jest:** Prowadzi małą, 3-osobową firmę. Często jest w terenie, a faktury za paliwo, narzędzia i materiały zbiera
  w samochodzie.
- **Cele:** Chce mieć porządek w dokumentach kosztowych, aby lepiej kontrolować finanse firmy i unikać problemów z
  Urzędem Skarbowym.
- **Frustracje:** Ręczne opisywanie segregatorów i faktur to dla niego strata czasu. Często ma problem z szybkim
  odnalezieniem konkretnego dokumentu sprzed kilku miesięcy.
- **Potrzeba:** _"Chcę mieć wszystkie faktury kosztowe w jednym miejscu online, dobrze opisane i gotowe do wysłania
  księgowej jednym kliknięciem, bez przekopywania się przez stosy papierów."_

---

## 3. Funkcjonalności i User Stories (MVP)

### 3.1. Uwierzytelnianie Użytkownika

- **Opis:** Bezpieczny system rejestracji i logowania.
- **User Story:** _"Jako użytkownik, chcę móc założyć konto i bezpiecznie się logować, aby chronić dostęp do moich
  wrażliwych dokumentów finansowych."_

### 3.2. Dodawanie Dokumentu przez Aplikację

- **Opis:** Możliwość dodania dokumentu poprzez zrobienie zdjęcia (mobile) lub wgranie pliku (desktop).
- **User Story:** _"Jako Marek, chcę móc zrobić zdjęcie faktury za paliwo telefonem od razu na stacji benzynowej, aby
  natychmiast dodać ją do systemu."_

### 3.3. Automatyczne Przetwarzanie Dokumentu

- **Opis:** System wysyła obraz dokumentu do agenta AI (Gemini 1.5 Flash) w celu ekstrakcji zdefiniowanego zestawu
  danych. Na podstawie odpowiedzi AI, system zapisuje dane w bazie i automatycznie generuje nazwę pliku.
- **Odczytywane Dane:** Nazwa wystawcy, NIP wystawcy, Data wystawienia, Numer faktury, Kwota Netto, Kwota Brutto, Stawki
  i kwoty VAT.
- **User Story:** _"Jako użytkownik, chcę, aby po dodaniu faktury system sam zrozumiał jej treść, zapisał kluczowe
  informacje i nadał plikowi zrozumiałą nazwę, abym ja nie musiał wprowadzać ani jednej danej ręcznie."_
- **Logika Nazewnictwa:**
    1. Format docelowy: `RRRR-MM-DD_NIP-WYSTAWCY_NR-FAKTURY.oryginalneRozszerzenie`
    2. Logika awaryjna: W przypadku braku danych system stosuje alternatywne formaty (np. z hashem lub słowem kluczowym
       `RECEIPT`), aby zapewnić unikalność i czytelność.

### 3.4. Przeglądanie Dokumentów

- **Opis:** Przejrzysta, posortowana chronologicznie lista wszystkich dokumentów.
- **User Story:** _"Jako Marek, chcę mieć prosty wgląd w listę wszystkich moich kosztów z ostatniego miesiąca, abym mógł
  na bieżąco kontrolować porządek w dokumentach."_

### 3.5. Eksport Miesięczny

- **Opis:** Funkcja pozwalająca wybrać miesiąc i pobrać jedną, spakowaną paczkę `.zip` ze wszystkimi dokumentami z tego
  okresu.
- **User Story:** _"Jako Anna, chcę na początku miesiąca móc w dwóch kliknięciach pobrać paczkę ze wszystkimi fakturami
  z poprzedniego miesiąca, aby szybko i sprawnie wysłać ją mailem do mojej księgowej."_

---

## 4. Wymagania Niefunkcjonalne

- **Wydajność:** Czas od wgrania dokumentu do jego pojawienia się na liście powinien być możliwie jak najkrótszy.
  Przetwarzanie przez AI odbywa się asynchronicznie w tle.
- **Bezpieczeństwo i Prywatność Danych:** Dane są zabezpieczone. Kluczowe jest zapewnienie prywatności danych
  przesyłanych do modelu LLM poprzez wybór dostawcy gwarantującego politykę "zero data retention".
- **Architektura:** System musi być **modularny**. Rdzeń Przetwarzania Dokumentów (Core Processing Engine) musi być
  zaprojektowany jako odseparowana usługa, co ułatwi w przyszłości rozbudowę o nowe źródła, takie jak serwer pocztowy.
- **Dostępność:** Aplikacja musi być w pełni funkcjonalna na najnowszych wersjach popularnych przeglądarek (Chrome,
  Safari, Firefox) na urządzeniach desktopowych i mobilnych.

---

## 5. Założenia i Ryzyka

- **Założenia:**
    - Model Gemini 1.5 Flash jest w stanie z wysoką skutecznością (>90%) i w akceptowalnym czasie analizować obrazy
      faktur.
    - Użytkownicy w fazie początkowej ("friends & family") akceptują ewentualne niedoskonałości w zamian za główną
      korzyść (automatyzacja).
- **Ryzyka:**
    - **Ryzyko Wysokie: Koszty Operacyjne.** Każde przetworzenie faktury wiąże się z kosztem zapytania do API LLM.
        - _Plan mitygacji (MVP):_ Uruchomienie produktu w kontrolowanym środowisku "friends & family" w celu oceny
          realnych kosztów przed publicznym udostępnieniem.
    - **Ryzyko Wysokie: Prywatność Danych (RODO/GDPR).** Przesyłanie wrażliwych danych finansowych do zewnętrznego
      dostawcy LLM.
        - _Plan mitygacji:_ Wybór wyłącznie dostawców z jasno zdefiniowaną polityką prywatności ("zero data retention").
          Transparentne informowanie użytkowników w regulaminie.
    - **Ryzyko Średnie: Dokładność Ekstrakcji Danych.** Model może popełniać błędy przy nietypowych formatach faktur.
        - _Plan mitygacji (MVP):_ Akceptacja ryzyka w fazie MVP. Zbieranie danych o błędach w celu priorytetyzacji
          przyszłych ulepszeń.

---

## 6. Kryteria Sukcesu i KPI (dla MVP)

- **Cel Biznesowy: Maksymalna, inteligentna automatyzacja i oszczędność czasu.**
    - **KPI 1 (Poziom automatyzacji):** Minimum **90%** wgranych dokumentów jest w pełni i poprawnie przetwarzanych (
      wszystkie kluczowe pola) bez potrzeby interwencji.
- **Cel Techniczny: Stworzenie solidnych fundamentów pod przyszły rozwój.**
    - **Wskaźnik sukcesu:** Wdrożenie modularnej architektury z odseparowanym Rdzeniem Przetwarzania Dokumentów, gotowym
      na przyszłą rozbudowę.

---

## 7. Zakres Negatywny (Co jest poza zakresem MVP)

Aby zapewnić szybkie wdrożenie i skupienie na kluczowej wartości, następujące funkcje **NIE ZOSTANĄ** zaimplementowane w
wersji MVP:

- **Możliwość dodawania dokumentów przez dedykowany adres e-mail.**
- Ręczna weryfikacja i edycja odczytanych danych przez użytkownika.
- Możliwość udostępniania dokumentów za pomocą "Magicznego Linku".
- Aktywne wykrywanie i blokowanie duplikatów dokumentów.
- Obliczanie podatków i przygotowywanie danych do plików JPK.
- Zaawansowane raporty, analizy i diagramy kosztów.
- System wieloagentowej weryfikacji poprawności danych.