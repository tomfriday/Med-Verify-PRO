# Med-Verify PRO 🏥

> **System designed as Testable by Design with strict RBAC verification. E2E suite utilizes Playwright Custom Fixtures and Global Auth Setup for maximum performance and stability.**

Profesjonalny system do rezerwacji wizyt lekarskich z podziałem na role (RBAC), autoryzacją JWT (HttpOnly Cookies) i pełną logiką biznesową.

---

## 🧪 Testy (Playwright + TypeScript)

Pełne pokrycie testami E2E i API z wykorzystaniem wzorców **Custom Fixtures**, **Page Object Model (POM)**, **API Interception/Mocking** oraz **Global Auth Setup (storageState)**.

### Uruchamianie testów
```bash
cd tests
npm ci                 # Instalacja zależności
npx playwright install # Instalacja przeglądarek

# Uruchom wszystkie testy
npm test

# Tylko API / E2E
npm run test:api
npm run test:e2e

# Tryb z podglądem (headed)
npm run test:headed
```

### Architektura Testów

| Wzorzec | Opis |
|---------|------|
| **Custom Fixtures** | Zamiast tworzyć `new LoginPage(page)` w każdym teście, wstrzykujemy POM bezpośrednio: `({ loginPage }) => { ... }`. Czyściejszy kod, lepsze podpowiedzi TypeScript. |
| **Page Object Model (POM)** | Logika UI wydzielona do `tests/pages/` — lokatory i akcje oddzielone od asercji. |
| **Global Auth Setup** | `auth.setup.ts` loguje się raz (Pacjent/Lekarz/Admin) i zapisuje `storageState` do JSON. Testy startują od razu zalogowane — zero powtarzania logowania. |
| **API Interception & Mocking** | Testy z `page.route()` przechwytują żądania i podmieniają odpowiedzi (500, puste dane, zepsuty JSON) — testowanie edge cases bez potrzeby specjalnych danych. |
| **data-testid Only** | W POM-ach nie ma ani jednego selektora CSS. Tylko `getByTestId()` — testy nie psują się przy redesignie. |
| **Data Seeding** | Przed startem baza resetowana endpointem `/api/test/reset` (tylko dev/test). |
| **RBAC & Security** | Testy API weryfikują uprawnienia (403 Forbidden) i kontrakt JSON (brak haseł w odpowiedziach). |
| **Trace Viewer + CI/CD** | GitHub Actions uruchamia testy przy każdym push. Przy błędzie: Trace (nagranie + DOM snapshoty + logi sieciowe), Video, Screenshot. |

### Struktura `tests/`
```
tests/
├── api/               # Testy API (RBAC, kontrakty, logika)
├── e2e/               # Testy E2E (Scenariusze użytkownika)
│   ├── admin.e2e.spec.ts
│   ├── doctor.e2e.spec.ts
│   ├── patient.e2e.spec.ts
│   ├── profile.e2e.spec.ts
│   ├── login.e2e.spec.ts
│   ├── search.e2e.spec.ts       # Data-Driven Testing
│   └── api-mocking.e2e.spec.ts  # API Interception & Mocking
├── pages/             # Page Object Models (tylko lokatory + akcje)
├── helpers/           # Helpery (auth, API)
├── fixtures.ts        # Custom Playwright Fixtures
├── auth.setup.ts      # Global Auth Setup (storageState)
└── playwright.config.ts
```

---

## 🚀 Uruchomienie Projektu

**Wymagania:** Node.js v16+, SQLite3

1. **Instalacja zależności**
   ```bash
   # Backend
   cd backend
   npm install
   
   # Frontend
   cd ../frontend
   npm install
   ```

2. **Konfiguracja Bazy Danych**
   ```bash
   cd backend
   npm run setup # Migracje + Seedowanie danych
   ```

3. **Uruchomienie (Dev Mode)**
   ```bash
   # Terminal 1 (Backend)
   cd backend
   npm start
   
   # Terminal 2 (Frontend)
   cd frontend
   npm run dev
   ```

Dostęp:
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3001`

---

## 🛠 Technologie

- **Backend**: Node.js, Express, Knex.js, SQLite, JWT (HttpOnly), Multer (uploady)
- **Frontend**: React, Vite, CSS Modules, Context API
- **Testy**: Playwright, TypeScript, Custom Fixtures, GitHub Actions

## 🔑 Konta Testowe (Seed)

| Rola | Email | Hasło |
|---|---|---|
| **Pacjent** | `patient1@test.com` | `password123` |
| **Lekarz** | `jan.kowalski@medverify.com` | `password123` |
| **Admin** | `admin@medverify.com` | `password123` |

---

## 🛡 Funkcjonalności

### 1. Uwierzytelnianie & Profil
- Logowanie / Rejestracja
- **Bezpieczeństwo**: Hasła hashowane (bcrypt), Tokeny w HttpOnly Cookie
- **Profil**: Możliwość zmiany imienia i **zdjęcia profilowego (Avatar)**
- Avatar widoczny w pasku nawigacji

### 2. Panel Pacjenta
- Wyszukiwanie lekarzy (Imię, Specjalizacja)
- Filtrowanie i Sortowanie (Cena rosnąco/malejąco)
- Rezerwacja wizyt (Sloty)
- Podgląd "Moje Wizyty" (Statusy, Odwoływanie)

### 3. Panel Lekarza
- Zarządzanie slotami czasowymi (Dodawanie/Usuwanie)
- Lista wizyt pacjentów
- Zmiana statusu wizyty (Potwierdź / Odwołaj / Zakończ)

### 4. Panel Admina
- Statystyki systemu (Liczba użytkowników, wizyt)
- **Logi Audytowe** (Kto, co, kiedy zrobił - pełna ścieżka audytowa dla compliance medycznego)
