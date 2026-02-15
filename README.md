# Med-Verify PRO 🏥

**Med-Verify PRO** to zaawansowany system rezerwacji wizyt lekarskich z podziałem na role (RBAC), autoryzacją JWT (HttpOnly Cookies) i pełną logiką biznesową.

---

## 🧪 Testy (`tests/`)

Projekt zawiera kompleksowe testy automatyczne w **Playwright + TypeScript**, podzielone na testy **API** i **E2E** (przeglądarkowe).

### Struktura testów

```
tests/
├── api/                          # Testy API (bez przeglądarki)
│   ├── auth.api.spec.ts          # Logowanie, rejestracja, /me, wylogowanie
│   ├── doctors.api.spec.ts       # Lista lekarzy, filtry, sortowanie, sloty
│   ├── appointments.api.spec.ts  # Rezerwacja wizyt, lista wizyt
│   ├── profile.api.spec.ts       # Profil użytkownika, edycja, avatar
│   └── admin.api.spec.ts         # RBAC, statystyki, logi audytu
├── e2e/                          # Testy E2E (Chromium)
│   ├── login.e2e.spec.ts         # Formularz logowania, walidacje, wylogowanie
│   ├── patient.e2e.spec.ts       # Dashboard pacjenta, filtry, wyszukiwanie
│   ├── doctor.e2e.spec.ts        # Dashboard lekarza, sloty, wizyty
│   ├── admin.e2e.spec.ts         # Dashboard admina, statystyki, logi
│   └── profile.e2e.spec.ts       # Strona profilu, edycja danych
├── helpers/
│   └── auth.helper.ts            # Funkcje pomocnicze (login, konta testowe)
├── playwright.config.ts          # Konfiguracja Playwright
├── tsconfig.json
└── package.json
```

### Uruchamianie testów

> **Wymaga:** uruchomionego backendu (`localhost:3001`) i frontendu (`localhost:5173`).

```bash
cd tests
npm install
npx playwright install chromium

# Wszystkie testy (API + E2E)
npm test

# Tylko testy API
npm run test:api

# Tylko testy E2E (przeglądarkowe)
npm run test:e2e

# E2E z widoczną przeglądarką
npm run test:headed

# Otwarcie raportu HTML
npm run test:report
```

### Pokrycie testów

| Obszar | API | E2E |
|---|:---:|:---:|
| Logowanie / Rejestracja / Wylogowanie | ✅ | ✅ |
| Autoryzacja JWT (HttpOnly cookie) | ✅ | — |
| RBAC (role: PATIENT, DOCTOR, ADMIN) | ✅ | ✅ |
| Wyszukiwanie / filtrowanie lekarzy | ✅ | ✅ |
| Sortowanie (cena asc/desc) | ✅ | ✅ |
| Rezerwacja wizyt | ✅ | — |
| Profil użytkownika (edycja, avatar) | ✅ | ✅ |
| Panel admina (statystyki, logi) | ✅ | ✅ |
| Nawigacja (avatar w navbarze) | — | ✅ |

---

## 🚀 Jak uruchomić projekt

### 1. Wymagania
- Node.js (v18+)
- npm

### 2. Instalacja i Baza Danych (Backend)

Wejdź do katalogu `backend`:
```bash
cd backend
npm install
```

Przygotuj bazę danych SQLite (migracje i seed):
```bash
# Tworzy tabele
npx knex migrate:latest

# Wypełnia bazę danymi (20 lekarzy, admin, pacjenci)
npx knex seed:run
```

Uruchom serwer (port 3001):
```bash
npm start
# lub: node src/server.js
```

### 3. Frontend

W nowym terminalu wejdź do katalogu `frontend`:
```bash
cd frontend
npm install
npm run dev
```

Aplikacja będzie dostępna pod adresem: **http://localhost:5173**

---

## 🔑 Dane logowania (Credentials)

Hasło dla **wszystkich** kont to: `password123`

### 👨‍💼 Administrator
- **Email:** `admin@medverify.com`
- **Rola:** Pełny dostęp do panelu <code>/admin</code> (statystyki, logi systemowe).

### 🩺 Lekarze (Przykładowi)
Lekarze mogą zarządzać swoim harmonogramem, wizytami i notatkami.

| Imię i Nazwisko | Specjalizacja | Email |
|---|---|---|
| **Dr. Jan Kowalski** | Internista | `jan.kowalski@medverify.com` |
| **Dr. Maria Nowak** | Kardiolog | `maria.nowak@medverify.com` |
| **Dr. Piotr Wiśniewski** | Neurolog | `piotr.wisniewski@medverify.com` |

*(W bazie znajduje się łącznie 20 lekarzy. Login to `imie.nazwisko@medverify.com`)*

### 👤 Pacjenci
Pacjenci mogą wyszukiwać lekarzy, rezerwować wizyty i zarządzać nimi.

| Użytkownik | Email |
|---|---|
| **Tomek Pacjent** | `patient1@test.com` |
| **Ewa Pacjentka** | `patient2@test.com` |

---

## ✨ Funkcjonalności

- **System ról (RBAC):** Pacjent, Lekarz, Administrator
- **Autoryzacja JWT** z HttpOnly Cookies
- **Wyszukiwanie lekarzy** z filtrami (specjalizacja, imię) i sortowaniem (cena, ocena)
- **Rezerwacja wizyt** z walidacją konfliktów i automatycznym wygasaniem
- **Panel lekarza:** zarządzanie slotami, wizytami i notatkami medycznymi
- **Panel admina:** statystyki systemowe i logi audytu z paginacją
- **Profil użytkownika:** edycja danych osobowych i upload avatara
- **Responsywny UI:** ciemny motyw z efektem glassmorphism

---

## 🛠️ Technologie
- **Backend:** Node.js, Express, SQLite, Knex.js, JWT (HttpOnly), bcryptjs, Multer
- **Frontend:** React, Vite, CSS (Glassmorphism UI)
- **Testy:** Playwright, TypeScript
- **Bezpieczeństwo:** Role-Based Access Control (RBAC), walidacja konfliktów rezerwacji, wygasanie wizyt.
