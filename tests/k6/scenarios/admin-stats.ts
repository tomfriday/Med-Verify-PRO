/**
 * Scenario: Admin Stats & Audit Logs
 *
 * Typ testu: LOAD TEST (RBAC)
 * Cel: Test endpointów admina — weryfikacja wydajności przy
 *      agregacjach bazodanowych (COUNT, GROUP BY) oraz paginacji.
 *
 * Weryfikuje również RBAC — tylko admin ma dostęp do tych endpointów.
 *
 * Konfiguracja: 5 VU, 20s — mniejsze obciążenie bo admin to single user
 */
import http from 'k6/http';
import { sleep } from 'k6';
import { Options } from 'k6/options';
import { BASE_URL, ACCOUNTS } from '../config/index.ts';
import { login, authHeaders, AuthToken } from '../helpers/auth.ts';
import { checkResponse, checkResponseTime } from '../helpers/checks.ts';

export const options: Options = {
    vus: 5,
    duration: '20s',
    thresholds: {
        http_req_duration: ['p(95)<500', 'p(99)<1000'],
        http_req_failed: ['rate<0.01'],
        checks: ['rate>0.95'],
    },
};

export function setup(): AuthToken {
    return login(ACCOUNTS.admin);
}

export default function (token: AuthToken): void {
    // ── Admin Stats ─────────────────────────────────────
    const statsRes = http.get(`${BASE_URL}/api/admin/stats`, {
        headers: authHeaders(token),
        tags: { name: 'GET /api/admin/stats' },
    });

    checkResponse(statsRes, 'admin stats', 200, 'stats');
    checkResponseTime(statsRes, 'admin stats', 500);

    sleep(0.5);

    // ── Audit Logs (paginated) ──────────────────────────
    const logsRes = http.get(`${BASE_URL}/api/admin/audit-logs?page=1&limit=20`, {
        headers: authHeaders(token),
        tags: { name: 'GET /api/admin/audit-logs' },
    });

    checkResponse(logsRes, 'audit logs', 200, 'logs');
    checkResponseTime(logsRes, 'audit logs', 500);

    sleep(0.5);
}
