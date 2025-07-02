# Opis Projektu: Rycztax

## 1. Cel i Wizja

Rycztax to aplikacja PWA (Progresywna Aplikacja Webowa) stworzona z myślą o freelancerach i właścicielach mikro-firm w Polsce. Jej głównym celem jest zautomatyzowanie procesu zarządzania fakturami kosztowymi.

**Wizja:** Aplikacja ma działać jak inteligentny asystent, który po zrobieniu zdjęcia faktury:
- Automatycznie odczytuje kluczowe dane (NIP, daty, kwoty, etc.) za pomocą modeli językowych (LLM).
- Generuje ustandaryzowaną nazwę dla pliku.
- Bezpiecznie przechowuje dokumenty.
- Ułatwia ich eksport i przekazanie do księgowości.

## 2. Kluczowe Funkcjonalności (MVP)

- **Uwierzytelnianie:** Bezpieczna rejestracja i logowanie użytkowników.
- **Przesyłanie Dokumentów:** Możliwość dodania faktury przez zrobienie zdjęcia (mobile) lub wgranie pliku (desktop).
- **Automatyczna Ekstrakcja Danych:** System wykorzystuje AI do odczytania danych z faktury i automatycznego nazwania pliku w formacie `RRRR-MM-DD_NIP-WYSTAWCY_NR-FAKTURY.pdf`.
- **Weryfikacja Danych:** Jeśli AI ma niską pewność co do odczytanych danych, użytkownik jest o tym informowany i może je łatwo poprawić.
- **Zarządzanie Dokumentami:** Przejrzysta lista wszystkich dokumentów z możliwością sortowania i filtrowania.
- **Eksport Miesięczny:** Funkcja pobierania paczki `.zip` ze wszystkimi dokumentami z wybranego miesiąca.

## 3. Stos Technologiczny

- **Framework Frontendowy:** Angular (wersja ~19.2.0)
- **UI Kit / Stylowanie:**
    - PrimeNG
    - Tailwind CSS
    - `tailwindcss-primeui` do integracji obu bibliotek.
- **Backend / Baza Danych:** Firebase (`@angular/fire`)
- **Testowanie:** Karma, Jasmine
- **Zależności kluczowe:** `rxjs`, `zone.js`, `tslib`

## 4. Struktura Projektu i Polecenia

- **Kod źródłowy:** `src/`
- **Główny komponent:** `src/app/app.component.ts`
- **Routing:** `src/app/app.routes.ts`
- **Logika biznesowa (features):** `src/app/features/` (np. `auth`, `files`, `home`)
- **Style globalne:** `src/styles.css`
- **Konfiguracja TypeScript:** `tsconfig.json`
- **Konfiguracja Angulara:** `angular.json`

### Najważniejsze Skrypty (`package.json`):

- **Uruchomienie serwera deweloperskiego:** `npm start` (lub `ng serve`)
- **Budowanie aplikacji produkcyjnej:** `npm run build`
- **Uruchomienie testów jednostkowych:** `npm test`

## 5. Architektura i Routing

Aplikacja jest zbudowana w oparciu o architekturę komponentową z leniwym ładowaniem (lazy loading) dla poszczególnych widoków, co jest zdefiniowane w `src/app/app.routes.ts`.

**Główne ścieżki:**
- `/login`: Strona logowania.
- `/create-account`: Strona tworzenia konta.
- `/dashboard`: Główny panel po zalogowaniu, chroniony przez `isAuthenticatedGuard`.

Trasy publiczne (`/login`, `/create-account`) są chronione przez `isNotAuthenticatedGuard`, aby uniemożliwić dostęp zalogowanym użytkownikom.
