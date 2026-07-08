# Kluczowe decyzje i założenia

## Cel tego dokumentu

Ten dokument opisuje najważniejsze decyzje architektoniczne i implementacyjne dla mikroserwisu oceny siły haseł. Wyjaśnia, dlaczego wybrano konkretne technologie, jak działa usługa oraz jakie założenia przyjęto podczas jej tworzenia.

## 1. Wybór technologii

### TypeScript
- wybrany, ponieważ zapewnia statyczne typowanie i lepsze doświadczenie programistyczne
- ułatwia utrzymanie, refaktoryzację i dokumentowanie kodu
- pozwala wcześnie wykrywać błędy przed uruchomieniem aplikacji

### Fastify
- wybrany jako lekki i szybki serwer HTTP
- oferuje prosty model pluginów oraz wysoką wydajność w przypadku mikroserwisów
- pozwala utrzymać warstwę transportu w prosty sposób i skupić się na obsłudze żądań i odpowiedzi

### Zod
- używany do walidacji danych wejściowych dla żądań POST
- zapewnia jasne reguły walidacji i spójne odpowiedzi błędów
- poprawia czytelność kontraktu API i zapobiega dostarczaniu niepoprawnych danych do logiki biznesowej

### zxcvbn
- używany jako baza do oceny siły hasła
- dostarcza dojrzałe heurystyki dotyczące przewidywalności hasła, dopasowań do słowników i wzorców związanych z danymi użytkownika
- zwraca wynik punktowy oraz czytelne rekomendacje

### Docker
- używany do konteneryzacji usługi, co ułatwia wdrażanie i testy lokalne
- zapewnia powtarzalne budowanie i izolację środowiska uruchomieniowego
- pozwala uruchamiać aplikację w identyczny sposób na różnych środowiskach

### GitHub Actions
- dodany w celu automatycznego sprawdzania jakości kodu po każdym pull requestcie i pushu do głównej gałęzi
- zapewnia szybki feedback dla developerów i ogranicza ryzyko błędów w kodzie

## 2. Model oceny i reguły biznesowe

### Hybrydowy model punktacji
Serwis łączy wyniki zxcvbn z własnymi regułami, aby jednocześnie korzystać z dojrzałej analizy hasła i wymuszać projektowe wymagania bezpieczeństwa.

- zxcvbn dostarcza punktację bazową oraz feedback oparty na entropii hasła, dopasowaniach do słowników i danych użytkownika
- własne reguły sprawdzają dodatkowe wymagania, takie jak minimalna długość, zróżnicowanie znaków oraz blokowanie oczywistych haseł
- takie podejście daje pewność, że usługa będzie stosować zarówno ogólne zasady bezpieczeństwa, jak i konkretne wymagania projektu

### Własne rekomendacje i reguły
- aplikacja generuje deterministyczne komunikaty typu „Dodaj co najmniej jedną wielką literę”
- hasła zawierające nazwę użytkownika lub adres email są karane, nawet jeśli zxcvbn nie obniży ich oceny wystarczająco
- wybrany zestaw popularnych haseł jest traktowany jako słaby, co zapewnia przewidywalne odrzucanie oczywistych wartości
- powtarzające się sekwencje znaków są traktowane jako słaby wzorzec i obniżają wynik

## 3. Co znajduje się w projekcie

### Struktura katalogów
- src/app.ts – buduje instancję aplikacji Fastify
- src/server.ts – uruchamia serwer i nasłuchuje na porcie 3000
- src/routes/ – warstwa routingu i endpointów HTTP
- src/routes/health/health.ts – endpoint zdrowia usługi
- src/routes/password-strength/password-strength.ts – endpoint oceny siły hasła
- src/services/passwordStrength/passwordStrength.ts – logika biznesowa oceny hasła
- src/services/passwordStrength/passwordStrength.types.ts – typy używane przez usługę
- src/**/*.test.ts – testy jednostkowe i integracyjne
- Dockerfile i .dockerignore – konfiguracja kontenera
- .github/workflows/ci.yml – automatyczne sprawdzanie projektu w CI

### Rozdzielenie odpowiedzialności
- logika biznesowa jest oddzielona od transportu HTTP
- endpointy obsługują tylko żądania i odpowiedzi, a nie reguły oceny hasła
- dzięki temu kod jest łatwiejszy do testowania i rozwijania

## 4. Endpointy

### GET /health
- prosty endpoint kontrolny służący do sprawdzania, czy usługa działa
- przydatny dla orchestratorów, kontenerów i systemów monitoringowych
- zwraca status działania oraz unikalny identyfikator żądania

### POST /api/v1/password-strength
- główny endpoint usługi
- przyjmuje obiekt JSON zawierający:
  - username
  - email
  - password
- zwraca:
  - score – wynik punktowy od 0 do 100
  - label – etykietę jakości hasła
  - feedback – listę rekomendacji
  - checks – informacje o spełnieniu podstawowych reguł
  - passwordLength – długość hasła
- w przypadku niepoprawnego payloadu zwraca błąd 400 z informacją o błędach walidacji

## 5. Testy

### Rodzaje testów
- testy jednostkowe dla logiki oceny hasła
- testy routingu dla endpointów HTTP
- testy integracyjne z użyciem narzędzia do uruchamiania żądań bez serwera HTTP

### Narzędzia testowe
- projekt korzysta z Vitest
- testy sprawdzają zarówno poprawne przypadki, jak i błędy walidacji oraz słabe hasła
- dzięki temu można szybko wykryć regresje po zmianach w logice oceny

## 6. Docker i wdrożenie

### Obsługa Dockera
- projekt zawiera plik Dockerfile oraz plik .dockerignore
- skrypty w package.json umożliwiają:
  - npm run build:docker – zbudowanie obrazu Docker
  - npm run dev:docker – uruchomienie usługi w kontenerze

### Dlaczego Docker jest używany
- ułatwia przenoszenie aplikacji między środowiskami
- zapewnia spójne środowisko uruchomieniowe lokalnie i w produkcji
- ogranicza problemy zależne od konkretnej maszyny developera lub serwera

## 7. CI (Continuous Integration)

### Jak działa CI
- workflow w .github/workflows/ci.yml uruchamia się przy pull requestach oraz pushach do gałęzi main/master
- wykonuje instalację zależności, kompilację TypeScript oraz testy

### Dlaczego CI jest ważne
- automatycznie sprawdza, czy kod nadal się buduje i przechodzi testy
- pozwala szybciej wykrywać błędy przed połączeniem zmian do głównej gałęzi
- zwiększa pewność jakości kodu i ułatwia pracę zespołową

## 8. Poprawna historia commitów

Historia commitów powinna być czytelna, uporządkowana i oparta na małych, logicznych zmianach.

### Zasady dobrej historii commitów
- każdy commit powinien dotyczyć jednej konkretnej zmiany
- komunikat commit message powinien mówić, co zostało zmienione i dlaczego
- warto unikać commitów typu „fix”, „update” bez kontekstu
- commit history powinno odzwierciedlać rozwój projektu krok po kroku

### Zalecany format komunikatów
Najlepiej stosować prosty i spójny styl, np.:
- feat: add password strength evaluation endpoint
- fix: handle invalid email input in validation
- refactor: extract scoring constants to dedicated config
- test: add route tests for weak passwords
- docs: translate decisions document to Polish
- chore: update Docker configuration

### Przykłady dobrych commitów
- feat: add health endpoint for service readiness
- feat: implement password strength scoring with zxcvbn
- test: cover invalid payload validation for password-strength route
- docs: document architecture decisions and deployment flow

## 9. Wartość tego projektu

Projekt jest wartościowy, ponieważ:
- dostarcza reusable mikroserwis do oceny siły haseł
- łączy sprawdzoną bibliotekę zxcvbn z własnymi regułami biznesowymi
- jest zbudowany w nowoczesnym stosie TypeScript z jasną walidacją i feedbackiem
- zawiera dokumentację, testy i obsługę Dockera
- jest mały, czytelny i łatwy do rozwijania
