# Engineering Guidelines for Rycztax

## 1. Wprowadzenie

Rycztax to inteligentny asystent w formie Progresywnej Aplikacji Webowej (PWA), stworzony z myślą o freelancerach i właścicielach mikro-firm w Polsce. Projekt ma na celu rozwiązanie problemu czasochłonnego, manualnego i podatnego na błędy procesu zarządzania fakturami kosztowymi. Dokument ten określa standardy techniczne, architektoniczne i procesowe obowiązujące w projekcie.

## 2. Stos Technologiczny

Oficjalny, kompletny stos technologiczny projektu jest następujący:

### Frontend - Angular 20

- **Angular 20** zapewni solidną, skalowalną architekturę, wykorzystując najnowsze funkcje frameworka w celu uzyskania wysokiej wydajności.
- **TypeScript 5** dla statycznego typowania kodu, co zwiększa jego bezpieczeństwo i ułatwia pracę w zespole.
- **PrimeNG** będzie stanowić podstawę naszego UI, dostarczając bogatą bibliotekę gotowych i dostępnych komponentów, co znacząco przyspieszy rozwój.

### Backend - Firebase jako kompleksowe rozwiązanie backendowe

- **Firestore:** Elastyczna, skalowalna baza danych NoSQL.
- **Firebase Authentication:** Wbudowany, bezpieczny system do uwierzytelniania użytkowników.
- **Cloud Storage for Firebase:** Wsparcie dla przechowywania i zarządzania plikami.
- **Firebase Functions:** Logika backendowa w formie bezserwerowych funkcji, m.in. jako bezpieczny pośrednik (proxy) dla zapytań do AI.
- **Firebase SDKs:** Zestawy narzędzi deweloperskich upraszczające integrację.

### AI - Komunikacja z modelami przez usługę Openrouter.ai lub VertexAI

- Dostęp do szerokiej gamy modeli w celu optymalizacji kosztów i wydajności.
- Możliwość ustawiania limitów finansowych na klucze API.

### CI/CD i Hosting

- **GitHub Actions** do tworzenia procesów CI/CD.
- **Firebase Hosting** do hostingu aplikacji frontendowej.

## 3. Struktura Projektu

- **`./src`**: Główny katalog z kodem źródłowym aplikacji.
- **`./src/features`**: Główne, domenowe funkcjonalności aplikacji (np. `invoices`, `auth`). Każda funkcjonalność powinna zawierać:
  - `data-access`: Serwisy i pliki `*.api.ts` odpowiedzialne za komunikację z zewnętrznymi usługami.
  - `ui`: Komponenty "View" - inteligentne, stanowe komponenty, reprezentujące całe widoki lub ich duże fragmenty.
  - `components`: Komponenty "Dumb" - reużywalne, bezstanowe komponenty prezentacyjne.
  - `models`: Typy i interfejsy specyficzne dla danej funkcjonalności.
- **`./src/shared`**: Katalog na reużywalne serwisy, komponenty, dyrektywy, potoki (pipes) i modele, które są współdzielone przez wiele funkcjonalności.
- **`*.api.ts`**: Do komunikacji z Firebase używamy dedykowanych plików `nazwa.api.ts`, które zawierają bezpośrednie wywołania SDK Firebase. Serwisy w `data-access` korzystają z tych plików `api`, a nie bezpośrednio z SDK. Umożliwi to w przyszłości łatwą wymianę źródła danych bez refaktoryzacji logiki biznesowej.

## 4. Wytyczne Techniczne

### 4.1. Frontend (Angular)

- **Standalone API:** Używamy komponentów, dyrektyw i potoków w trybie `standalone` zamiast `NgModules`.
- **State Management:** Do zarządzania stanem wewnątrz komponentów preferujemy `Signals` zamiast `RxJS`. `RxJS` pozostaje narzędziem do obsługi zdarzeń asynchronicznych (np. wywołania API).
- **Dependency Injection:** Używamy nowej funkcji `inject()` zamiast wstrzykiwania zależności przez konstruktor.
- **Control Flow:** Implementujemy logikę w szablonach za pomocą nowej składni `@if`, `@for`, `@switch`.
- **Guards & Resolvers:** Używamy funkcyjnych guardów i resolverów zamiast klasowych.
- **Deferred Loading:** Wykorzystujemy `@defer` do optymalizacji ładowania widoków i obsługi stanu ładowania.
- **Change Detection:** Wszystkie komponenty powinny domyślnie używać strategii detekcji zmian `OnPush` dla maksymalnej wydajności.
- **Service Communication:** Komponenty komunikują się z warstwą danych wyłącznie poprzez dedykowane serwisy. Nigdy nie powinny wywoływać bezpośrednio plików `*.api.ts`.

### 4.2. Baza Danych (Firebase/Firestore)

- **Bezpieczeństwo "Deny-by-default":** Wszystkie ścieżki w bazie danych są domyślnie zablokowane. Dostęp (`read`, `write`) jest nadawany jawnie i tylko dla autoryzowanych użytkowników i wymaganych operacji.
- **Security Rules:** Dostęp do danych jest kontrolowany na poziomie bazy danych przy użyciu reguł bezpieczeństwa. Role użytkowników na start to: `user`.
- **Firebase Functions dla Złożonych Operacji:** Logikę, której nie da się wyrazić w regułach bezpieczeństwa (np. kaskadowe usuwanie, złożona walidacja), implementujemy w Firebase Functions.
- **Płytkie Zapytania (Shallow Queries):** Projektujemy strukturę danych tak, aby unikać pobierania dużych, zagnieżdżonych obiektów, minimalizując zużycie transferu.
- **Offline First:** Wykorzystujemy wbudowane w SDK Firebase mechanizmy offline, aby zapewnić płynne działanie aplikacji nawet przy niestabilnym połączeniu z internetem.

### 4.3. DevOps (GitHub Actions)

- **Struktura Workflow:** Zmienne środowiskowe (`env:`) i sekrety (`secrets`) są definiowane na poziomie zadania (`job`), a nie globalnie w całym workflow.
- **Instalacja Zależności:** Zawsze używamy `npm ci` zamiast `npm install` do instalacji zależności w środowisku CI w celu zapewnienia powtarzalności buildów.
- **Kroki Obowiązkowe:** Każdy workflow uruchamiany na Pull Request do gałęzi `main` musi zawierać kroki:
  1.  Lintowanie kodu (`npm run lint`)
  2.  Uruchomienie testów jednostkowych (`npm run test -- --no-watch --browsers=ChromeHeadless`)
  3.  Budowanie aplikacji (`npm run build`)
- **Akcje Kompozytowe:** Wspólne, powtarzalne kroki (np. konfiguracja Node.js, cache'owanie `node_modules`) są ekstrahowane do akcji kompozytowych w osobnych plikach.
- **Wersjonowanie Akcji:** W plikach workflow używamy tylko głównych wersji publicznych akcji (np. `actions/checkout@v4`), aby zapewnić stabilność i automatyczne otrzymywanie poprawek bezpieczeństwa.

### 4.4. Praktyki Kodowania

#### Analiza Statyczna (Prettier)

- Jedna, spójna konfiguracja w pliku `.prettierrc` jest używana w całym projekcie.
- Formatowanie "on save" jest skonfigurowane w edytorach w celu natychmiastowego feedbacku.
- Plik `.prettierignore` wyklucza z formatowania m.in. katalog `dist/` i inne pliki generowane automatycznie.
- Szerokość linii (`printWidth`) jest ustawiona na `100` znaków.

#### Kontrola Wersji (Git)

- **Conventional Commits:** Używamy standardu Conventional Commits do tworzenia historii zmian (np. `feat:`, `fix:`, `docs:`, `chore:`).
- **Nazewnictwo Branchy:** Gałęzie z nowymi funkcjonalnościami lub poprawkami tworzymy według formatu: `typ/TICKET-ID_krotki-opis` (np. `feature/RTX-123_invoice-export-button`).
- **Fokusowane Commity:** Każdy commit reprezentuje jedną, logiczną zmianę. Unikamy wielkich commitów z wieloma niepowiązanymi zmianami.
- **Przejrzysta Historia:** Używamy `git rebase -i` do czyszczenia i porządkowania historii commitów na branchu funkcyjnym przed jego zmergowaniem do `main`.
- **Git Hooks:** Wykorzystujemy hooki (np. `pre-commit` z husky) do uruchamiania lintera lub testów przed wykonaniem commita.

## 5. Podsumowanie Wykonanych Prac

W ramach ostatnich działań, wprowadzono następujące kluczowe zmiany i ulepszenia:

*   **Konfiguracja Emulatorów Firebase:** Poprawiono konfigurację emulatorów Firestore w `packages/app/src/app/app.config.ts` oraz uzupełniono `apphosting.emulator.yaml` o poprawne porty dla emulatorów Auth, Firestore i Storage. Zapewnia to stabilne środowisko deweloperskie i testowe.
*   **Usprawnienie Pobierania Danych z Firestore:** Zaimplementowano deklaratywne podejście do pobierania i filtrowania danych z Firestore w `packages/app/src/app/features/files/pages/files.page.component.ts`. Wykorzystano reaktywne strumienie RxJS (`Observable`) oraz funkcje `query` i `where` do dynamicznego filtrowania faktur (np. po statusie 'processed'), zgodnie z zasadami programowania funkcyjnego i reaktywnego.
*   **Aktualizacja Wytycznych Architektonicznych:** Zaktualizowano plik `.ai/prompts/architect.prompt.txt`, aby odzwierciedlał preferencje dotyczące deklaratywnego programowania funkcyjnego, użycia Angular Signals (zamiast inicjalizacji stanu w konstruktorze) oraz reaktywnych strumieni danych z czystymi funkcjami.
*   **Optymalizacja Procesu Wdrożenia:** Przeanalizowano istniejącą strukturę monorepo i skrypty, a następnie zoptymalizowano instrukcje wdrożenia aplikacji na Firebase, wykorzystując istniejące skrypty `npm run build` i `firebase deploy` z odpowiednich katalogów.