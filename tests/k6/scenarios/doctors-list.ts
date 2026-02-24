/**
 * Scenario: Doctors Listing
 *
 * Typ testu: LOAD TEST
 * Cel: Test publicznego endpointu listowania lekarzy z filtrami.
 *      Jest to endpoint bez autoryzacji — dostępny dla wszystkich.
 *
 * Scenariusz testuje:
 * - GET /api/doctors (pełna lista)
 * - GET /api/doctors?specialization=Kardiolog (filtr po specjalizacji)
 * - GET /api/doctors?sortBy=price&order=asc (sortowanie)
 * - GET /api/doctors?search=Jan (wyszukiwanie po nazwisku)
 *
 * Konfiguracja: 15 VU, 30s — wyższe obciążenie bo endpoint publiczny
 */
import http from 'k6/http';
import { sleep } from 'k6';
import { Options } from 'k6/options';
import { BASE_URL } from '../config/index.ts';
import { checkResponse, checkResponseTime, checkArrayNotEmpty } from '../helpers/checks.ts';

export const options: Options = {
    vus: 15,
    duration: '30s',
    thresholds: {
        http_req_duration: ['p(95)<500', 'p(99)<1000'],
        http_req_failed: ['rate<0.01'],
        checks: ['rate>0.95'],
    },
};

export default function (): void {
    // ── Wariant 1: Pełna lista lekarzy ─────────────────
    const allDoctors = http.get(`${BASE_URL}/api/doctors`, {
        tags: { name: 'GET /api/doctors' },
    });
    checkResponse(allDoctors, 'all doctors', 200, 'doctors');
    checkArrayNotEmpty(allDoctors, 'all doctors', 'doctors');
    checkResponseTime(allDoctors, 'all doctors', 500);

    sleep(0.5);

    // ── Wariant 2: Filtr po specjalizacji ───────────────
    const filtered = http.get(`${BASE_URL}/api/doctors?specialization=Kardiolog`, {
        tags: { name: 'GET /api/doctors?specialization' },
    });
    checkResponse(filtered, 'filtered doctors', 200, 'doctors');
    checkResponseTime(filtered, 'filtered doctors', 500);

    sleep(0.3);

    // ── Wariant 3: Sortowanie po cenie ──────────────────
    const sorted = http.get(`${BASE_URL}/api/doctors?sortBy=price&order=asc`, {
        tags: { name: 'GET /api/doctors?sortBy=price' },
    });
    checkResponse(sorted, 'sorted doctors', 200, 'doctors');
    checkResponseTime(sorted, 'sorted doctors', 500);

    sleep(0.3);

    // ── Wariant 4: Wyszukiwanie tekstowe ────────────────
    const searched = http.get(`${BASE_URL}/api/doctors?search=Jan`, {
        tags: { name: 'GET /api/doctors?search' },
    });
    checkResponse(searched, 'search doctors', 200, 'doctors');
    checkResponseTime(searched, 'search doctors', 500);

    sleep(0.5);
}
