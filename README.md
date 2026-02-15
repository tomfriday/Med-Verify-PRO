# Med-Verify PRO 🏥

Profesjonalny system do rezerwacji wizyt lekarskich (Zalecenie: "Sprawa życia i śmierci").

**Med-Verify PRO** to zaawansowany system rezerwacji wizyt lekarskich z podziałem na role (RBAC), autoryzacją JWT (HttpOnly Cookies) i pełną logiką biznesową.

---

## 🧪 Testy (Playwright + TypeScript)

Pełne pokrycie testami E2E i API z wykorzystaniem wzorców **Page Object Model (POM)** oraz **reuse authentication state**.

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
- **Page Object Model (POM)**: Logika UI wydzielona do `tests/pages/` (np. `LoginPage.ts`, `PatientDashboard.ts`).
- **Auth Reuse**: `auth.setup.ts` loguje się raz (Pacjent/Lekarz/Admin) i zapisuje stan sesji (`storageState`) do plików JSON. Testy startują od razu zalogowane.
- **Data Seeding**: Przed startem testów baza jest resetowana endpointem `/api/test/reset` (tylko w trybie dev/test).
- **RBAC & Security**: Testy API weryfikują uprawnienia (403 Forbidden) i kontrakt JSON (brak haseł w odpowiedziach).
- **CI/CD**: GitHub Actions (`.github/workflows/playwright.yml`) uruchamia testy przy każdym pushu, zapisując Trace i Video w razie błędów.

### Struktura `tests/`
```
tests/
├── api/             # Testy API (RBAC, kontrakty, logika)
├── e2e/             # Testy E2E (Scenariusze użytkownika)
├── pages/           # Page Object Models
├── auth.setup.ts    # Globalne logowanie (tworzy .auth/*.json)
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
- **Testy**: Playwright, TypeScript, GitHub Actions

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
