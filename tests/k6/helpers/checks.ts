/**
 * Reużywalne asercje (checks) dla K6.
 *
 * Podejście DRY — zamiast powtarzać te same check() w każdym scenariuszu,
 * definiujemy je raz i importujemy tam gdzie potrzebne.
 */
import { check } from 'k6';
import { RefinedResponse, ResponseType } from 'k6/http';

/**
 * Sprawdza status HTTP i obecność wymaganego pola w JSON body.
 */
export function checkResponse(
    res: RefinedResponse<ResponseType>,
    tag: string,
    expectedStatus: number,
    requiredField?: string
): boolean {
    const checks: Record<string, (r: RefinedResponse<ResponseType>) => boolean> = {
        [`${tag} — status ${expectedStatus}`]: (r) => r.status === expectedStatus,
    };

    if (requiredField) {
        checks[`${tag} — has '${requiredField}' field`] = (r) => {
            const body = r.json() as Record<string, unknown>;
            return body?.[requiredField] !== undefined;
        };
    }

    return check(res, checks);
}

/**
 * Sprawdza czy odpowiedź mieści się w limicie czasowym.
 */
export function checkResponseTime(
    res: RefinedResponse<ResponseType>,
    tag: string,
    maxMs: number
): boolean {
    return check(res, {
        [`${tag} — response time < ${maxMs}ms`]: (r) => r.timings.duration < maxMs,
    });
}

/**
 * Sprawdza czy tablica w odpowiedzi nie jest pusta.
 */
export function checkArrayNotEmpty(
    res: RefinedResponse<ResponseType>,
    tag: string,
    arrayField: string
): boolean {
    return check(res, {
        [`${tag} — '${arrayField}' is non-empty array`]: (r) => {
            const body = r.json() as Record<string, unknown[]>;
            return Array.isArray(body?.[arrayField]) && body[arrayField].length > 0;
        },
    });
}
