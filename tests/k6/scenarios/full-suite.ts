/**
 * Full Suite — agregacja wszystkich scenariuszy K6
 *
 * Używa K6 Scenarios API do uruchomienia wielu scenariuszy
 * w jednym przebiegu z osobnymi VU i konfiguracją.
 *
 * Uruchomienie: k6 run dist/full-suite.js
 */
import http from 'k6/http';
import { sleep } from 'k6';
import { Options } from 'k6/options';
import { BASE_URL, ACCOUNTS } from '../config/index.ts';
import { login, authHeaders, AuthToken } from '../helpers/auth.ts';
import { checkResponse, checkResponseTime, checkArrayNotEmpty } from '../helpers/checks.ts';

// ─── Interfejs danych z setup() ───────────────────────
interface SetupData {
    patientToken: AuthToken;
    adminToken: AuthToken;
}

export const options: Options = {
    scenarios: {
        smoke_health: {
            executor: 'shared-iterations',
            vus: 1,
            iterations: 3,
            exec: 'smokeHealth',
            tags: { scenario: 'smoke' },
        },
        auth_flow: {
            executor: 'constant-vus',
            vus: 5,
            duration: '20s',
            exec: 'authFlow',
            startTime: '2s',
            tags: { scenario: 'auth' },
        },
        doctors_list: {
            executor: 'constant-vus',
            vus: 10,
            duration: '20s',
            exec: 'doctorsList',
            startTime: '2s',
            tags: { scenario: 'doctors' },
        },
        appointments: {
            executor: 'constant-vus',
            vus: 5,
            duration: '20s',
            exec: 'appointmentsList',
            startTime: '5s',
            tags: { scenario: 'appointments' },
        },
        admin_stats: {
            executor: 'constant-vus',
            vus: 3,
            duration: '15s',
            exec: 'adminStats',
            startTime: '5s',
            tags: { scenario: 'admin' },
        },
    },
    thresholds: {
        http_req_duration: ['p(95)<800'],
        http_req_failed: ['rate<0.02'],
        checks: ['rate>0.90'],
    },
};

// ─── Setup: logujemy się na potrzebne konta ─────────────
export function setup(): SetupData {
    const patientToken = login(ACCOUNTS.patient);
    const adminToken = login(ACCOUNTS.admin);
    return { patientToken, adminToken };
}

// ─── Scenario functions ─────────────────────────────────

export function smokeHealth(): void {
    const res = http.get(`${BASE_URL}/api/health`, {
        tags: { name: 'GET /api/health' },
    });
    checkResponse(res, 'health', 200, 'status');
    sleep(0.5);
}

export function authFlow(): void {
    const loginRes = http.post(
        `${BASE_URL}/api/auth/login`,
        JSON.stringify({
            email: ACCOUNTS.patient.email,
            password: ACCOUNTS.patient.password,
        }),
        { headers: { 'Content-Type': 'application/json' }, tags: { name: 'POST /api/auth/login' } }
    );
    checkResponse(loginRes, 'login', 200, 'user');

    const setCookie = loginRes.headers['Set-Cookie'] || '';
    const tokenMatch = setCookie.match(/token=([^;]+)/);
    const cookie = tokenMatch ? `token=${tokenMatch[1]}` : '';

    sleep(0.3);

    const meRes = http.get(`${BASE_URL}/api/auth/me`, {
        headers: { Cookie: cookie },
        tags: { name: 'GET /api/auth/me' },
    });
    checkResponse(meRes, '/me', 200, 'user');

    sleep(0.3);

    http.post(`${BASE_URL}/api/auth/logout`, null, {
        headers: { Cookie: cookie },
        tags: { name: 'POST /api/auth/logout' },
    });

    sleep(0.5);
}

export function doctorsList(): void {
    const res = http.get(`${BASE_URL}/api/doctors`, {
        tags: { name: 'GET /api/doctors' },
    });
    checkResponse(res, 'doctors', 200, 'doctors');
    checkArrayNotEmpty(res, 'doctors', 'doctors');

    sleep(0.3);

    http.get(`${BASE_URL}/api/doctors?specialization=Kardiolog`, {
        tags: { name: 'GET /api/doctors?specialization' },
    });

    sleep(0.5);
}

export function appointmentsList(data: SetupData): void {
    const res = http.get(`${BASE_URL}/api/appointments`, {
        headers: authHeaders(data.patientToken),
        tags: { name: 'GET /api/appointments' },
    });
    checkResponse(res, 'appointments', 200, 'appointments');
    sleep(1);
}

export function adminStats(data: SetupData): void {
    const statsRes = http.get(`${BASE_URL}/api/admin/stats`, {
        headers: authHeaders(data.adminToken),
        tags: { name: 'GET /api/admin/stats' },
    });
    checkResponse(statsRes, 'admin stats', 200, 'stats');

    sleep(0.3);

    http.get(`${BASE_URL}/api/admin/audit-logs?page=1&limit=20`, {
        headers: authHeaders(data.adminToken),
        tags: { name: 'GET /api/admin/audit-logs' },
    });

    sleep(0.5);
}
