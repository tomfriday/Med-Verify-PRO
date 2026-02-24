/**
 * Scenario: Auth Flow
 *
 * Typ testu: LOAD TEST
 * Cel: Test wydajności pełnego flow uwierzytelnienia:
 *      POST /api/auth/login → GET /api/auth/me → POST /api/auth/logout
 *
 * Ten scenariusz jest szczególnie ważny, ponieważ:
 * - Login wykonuje bcrypt.compareSync (CPU-intensive)
 * - /me wymaga JWT weryfikacji + DB lookup
 * - Cały pipeline auth musi działać szybko
 *
 * Konfiguracja: 10 VU, 30s — symulacja 10 równoczesnych sesji logowania
 */
import http from 'k6/http';
import { sleep } from 'k6';
import { Options } from 'k6/options';
import { BASE_URL, ACCOUNTS } from '../config/index.ts';
import { checkResponse, checkResponseTime } from '../helpers/checks.ts';

export const options: Options = {
    vus: 10,
    duration: '30s',
    thresholds: {
        http_req_duration: ['p(95)<800', 'p(99)<1500'],
        http_req_failed: ['rate<0.01'],
        checks: ['rate>0.95'],
    },
};

export default function (): void {
    // ── Step 1: Login ──────────────────────────────────
    const loginRes = http.post(
        `${BASE_URL}/api/auth/login`,
        JSON.stringify({
            email: ACCOUNTS.patient.email,
            password: ACCOUNTS.patient.password,
        }),
        { headers: { 'Content-Type': 'application/json' }, tags: { name: 'POST /api/auth/login' } }
    );

    checkResponse(loginRes, 'login', 200, 'user');
    checkResponseTime(loginRes, 'login', 800);

    // Extract cookie
    const setCookie = loginRes.headers['Set-Cookie'] || '';
    const tokenMatch = setCookie.match(/token=([^;]+)/);
    const cookie = tokenMatch ? `token=${tokenMatch[1]}` : '';

    sleep(0.5);

    // ── Step 2: GET /me ────────────────────────────────
    const meRes = http.get(`${BASE_URL}/api/auth/me`, {
        headers: { Cookie: cookie },
        tags: { name: 'GET /api/auth/me' },
    });

    checkResponse(meRes, '/me', 200, 'user');
    checkResponseTime(meRes, '/me', 300);

    sleep(0.3);

    // ── Step 3: Logout ─────────────────────────────────
    const logoutRes = http.post(`${BASE_URL}/api/auth/logout`, null, {
        headers: { Cookie: cookie },
        tags: { name: 'POST /api/auth/logout' },
    });

    checkResponse(logoutRes, 'logout', 200, 'message');

    sleep(0.5);
}
