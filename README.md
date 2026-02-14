# Med-Verify PRO 🏥

**Med-Verify PRO** to zaawansowany system rezerwacji wizyt lekarskich z podziałem na role (RBAC), autoryzacją JWT (HttpOnly Cookies) i pełną logiką biznesową.

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

## 🛠️ Technologie
- **Backend:** Node.js, Express, SQLite, Knex.js, JWT (HttpOnly), bcryptjs
- **Frontend:** React, Vite, CSS Modules (Glassmorphism UI)
- **Bezpieczeństwo:** Role-Based Access Control (RBAC), walidacja konfliktów rezerwacji, wygasanie wizyt.
