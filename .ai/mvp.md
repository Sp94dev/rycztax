# Aplikacja - Rycztax (MVP)

### Główny problem

Tworzenie i przechowywanie faktur jest problematyczne i wymaga wielu manualnych działań, od zrobienia zdjęcia, konwersji do pdf, odpowiedniego nazwania, katalogowania oraz wysłania do określonego terminu do księgowej.

Aplikacja webowa która wykorzystuje API przeglądarki i w wersji mobilnej pozwala na stworzenie zdjęcia dokumentu, który nastepnie jest obrabiany (wycinane niepotrzebne tło), konwertowany do formatu pdf i zapisywany w formacie RRRR-MM-DD_NIP-WYSTAWCY_NR-FAKTURY.pdf w storage. Następnie Odczytywane są dane, zapisywane w bazie danych w celu analizy o obróbki w przyszłości. Kolejnym elementem jest wsparcie wysyłania faktur do księgowości.

### Najmniejszy zestaw funkcjonalności

- Wgrywanie zdjęcia dokumentu (wgraniez dysku lub robienie zdjęcia w wersji mobilnej)
- Logowanie i rejestracja
- Konwertowanie dokumentu do PDF wraz z wycięciem zbędnych rzeczy jak tło
- Przeglądanie posiadancyh dokumentów wraz z moliwością filtrowania i sortowania
- Generowanie odpowiendnich nazw
- Pobieranie paczki dokumentów za wybrany miesiąc
- Zapisywanie szczegółów w bazie danych

### Co NIE wchodzi w zakres MVP

- Analiza danych
- Tworzenie raportów oraz diagramów
- Wyliczanie podatków
- Generowanie plików JPK
- Generowanie nowych faktur

### Kryteria sukcesu

- Autoamtyczny proces wgrywania i katologowania faktur
- Moliwie jak najprostszy sposób przesyłania dokumentów na wybrany adres
