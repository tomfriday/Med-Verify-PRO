/**
 * Centralny plik konfiguracyjny testów wydajnościowych K6.
 *
 * Zawiera:
 * - BASE_URL — adres serwera backendowego
 * - ACCOUNTS — dane logowania dla poszczególnych ról (RBAC)
 * - DEFAULT_THRESHOLDS — wspólne progi wydajnościowe
 * - LOAD_PROFILES — predefiniowane profile obciążenia
 */

// ─── Base URL ────────────────────────────────────────────────
export const BASE_URL = __ENV.BASE_URL || 'http://localhost:3001';

// ─── Test Accounts (spójne z istniejącym auth.helper.ts) ─────
export interface AccountCredentials {
    email: string;
    password: string;
}

export const ACCOUNTS: Record<string, AccountCredentials> = {
    patient: { email: 'patient1@test.com', password: 'password123' },
    patient2: { email: 'patient2@test.com', password: 'password123' },
    doctor: { email: 'jan.kowalski@medverify.com', password: 'password123' },
    admin: { email: 'admin@medverify.com', password: 'password123' },
};

// ─── Default Thresholds ───────────────────────────────────────
export const DEFAULT_THRESHOLDS = {
    http_req_duration: ['p(95)<500', 'p(99)<1000'],
    http_req_failed: ['rate<0.01'],
};

// ─── Reusable Load Profiles ──────────────────────────────────
export const LOAD_PROFILES = {
    smoke: { vus: 1, iterations: 1 },
    low: { vus: 5, duration: '20s' },
    medium: { vus: 10, duration: '30s' },
    high: { vus: 15, duration: '30s' },
};
