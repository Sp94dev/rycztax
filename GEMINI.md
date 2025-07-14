# Opis Projektu: Rycztax

## 1. Cel i Wizja

Rycztax to aplikacja PWA (Progresywna Aplikacja Webowa), której celem jest zautomatyzowanie procesu zarządzania fakturami kosztowymi dla polskich przedsiębiorców.

**Wizja:** Aplikacja działa jako inteligentny asystent. Po wgraniu pliku z fakturą, **Rdzeń Przetwarzania Dokumentów (Core Processing Engine)**, działający jako modularna usługa w backendzie, automatycznie przetwarza dokument, organizuje go i przygotowuje do dalszego użytku.

## 2. Wymagania i Zakres Produktu

Pełny zakres funkcjonalny, wymagania i cele biznesowe projektu są zdefiniowane w poniższych dokumentach. Stanowią one jedyne źródło prawdy (Single Source of Truth) na temat tego, co budujemy.

- **Minimalny Zestaw Funkcjonalności:** Zobacz plik **[MVP.md](./MVP.md)**.
- **Pełny Kontekst Produktowy:** Zobacz plik **[PRD.md](./PRD.md)**.

## 3. Stos Technologiczny

- **Framework Frontendowy:** Angular
- **UI Kit / Stylowanie:** PrimeNG, Tailwind CSS
- **Backend i Baza Danych:** Firebase (Firestore, Storage, Authentication, Cloud Functions)
- **Kluczowe Zależności:** `@angular/fire`, `rxjs`, `zone.js`, `tslib`

## 4. Struktura Projektu i Polecenia

Projekt jest zorganizowany jako **monorepo**, aby oddzielić od siebie poszczególne części systemu.

- `packages/app` -> Aplikacja frontendowa w Angularze. Tutaj znajduje się cała logika interfejsu użytkownika.
- `packages/firebase` -> Konfiguracja i logika backendowa Firebase. Zawiera Cloud Functions (w tym Rdzeń Przetwarzania Dokumentów), reguły bezpieczeństwa Firestore, reguły Storage.
- `packages/shared` -> Współdzielony kod, głównie definicje typów i interfejsów (np. `interface Invoice`), które są używane zarówno przez frontend (`app`), jak i backend (`firebase`).

### Najważniejsze Skrypty (`package.json` w głównym katalogu):

- **Uruchomienie serwera deweloperskiego (Angular):** `npm start`
- **Budowanie aplikacji produkcyjnej:** `npm run build`
- **Uruchomienie testów jednostkowych:** `npm test`
- **Wdrożenie funkcji Firebase:** `npm run deploy:firebase` (lub podobne, zdefiniowane w projekcie)

---
**Wazne:**
Twoja osobowość jest okrślonna w /.ai/prompts/architect.prompt.txt
CZESC KTORA ZAPISUJE STAN EMULATOROW MA BYC NIETYKALNA I OBOWIAZKOWA. NIGDY NIE WOLNO CI JEJ WYLACZYCZ.