/**
 * Scenario: Smoke Test — Health Check
 *
 * Typ testu: SMOKE TEST
 * Cel: Weryfikacja, że API jest dostępne i odpowiada poprawnie.
 * Konfiguracja: 1 VU, 1 iteracja — minimalny test „czy serwer żyje".
 *
 * Jest to pierwszy test jaki powinien się uruchomić — jeśli health check
 * nie przechodzi, to nie ma sensu uruchamiać pozostałych scenariuszy.
 */
import http from 'k6/http';
import { sleep } from 'k6';
import { Options } from 'k6/options';
import { BASE_URL } from '../config/index.ts';
import { checkResponse, checkResponseTime } from '../helpers/checks.ts';

export const options: Options = {
    vus: 1,
    iterations: 1,
    thresholds: {
        http_req_duration: ['p(95)<300'],
        http_req_failed: ['rate<0.01'],
        checks: ['rate==1.0'],
    },
};

export default function (): void {
    const res = http.get(`${BASE_URL}/api/health`);

    checkResponse(res, 'health check', 200, 'status');
    checkResponseTime(res, 'health check', 300);

    sleep(0.5);
}
