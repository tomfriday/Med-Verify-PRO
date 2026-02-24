/**
 * Scenario: Appointments Listing
 *
 * Typ testu: LOAD TEST
 * Cel: Test authenticated endpointu listowania wizyt.
 *      Endpoint wykonuje JOIN na 3 tabelach (appointments, slots, users x2).
 *
 * Wzorzec: setup() + data passing
 * - Login w setup() — raz na cały test
 * - Token przekazany do default function via data
 *
 * Konfiguracja: 10 VU, 30s
 */
import http from 'k6/http';
import { sleep } from 'k6';
import { Options } from 'k6/options';
import { BASE_URL, ACCOUNTS } from '../config/index.ts';
import { login, authHeaders, AuthToken } from '../helpers/auth.ts';
import { checkResponse, checkResponseTime } from '../helpers/checks.ts';

export const options: Options = {
    vus: 10,
    duration: '30s',
    thresholds: {
        http_req_duration: ['p(95)<500', 'p(99)<1000'],
        http_req_failed: ['rate<0.01'],
        checks: ['rate>0.95'],
    },
};

/**
 * Setup phase — logujemy się raz i zwracamy token.
 * K6 przekaże ten obiekt do każdego VU.
 */
export function setup(): AuthToken {
    return login(ACCOUNTS.patient);
}

/**
 * Main VU function — każdy VU symuluje pacjenta
 * sprawdzającego swoje wizyty.
 */
export default function (token: AuthToken): void {
    const res = http.get(`${BASE_URL}/api/appointments`, {
        headers: authHeaders(token),
        tags: { name: 'GET /api/appointments' },
    });

    checkResponse(res, 'appointments', 200, 'appointments');
    checkResponseTime(res, 'appointments', 500);

    sleep(1);
}
