/**
 * Helper autoryzacji — login via API i zarządzanie tokenem cookie.
 *
 * Wzorzec: Setup-phase authentication
 * - Logujemy się raz w setup() i przekazujemy token do default function
 * - Unikamy logowania w każdej iteracji (realistyczne obciążenie)
 */
import http from 'k6/http';
import { check, fail } from 'k6';
import { BASE_URL, AccountCredentials } from '../config/index.ts';

export interface AuthToken {
    cookie: string;
    userId: number;
    role: string;
}

/**
 * Loguje użytkownika i zwraca cookie token.
 * Używane głównie w setup() scenariuszy.
 */
export function login(account: AccountCredentials): AuthToken {
    const res = http.post(
        `${BASE_URL}/api/auth/login`,
        JSON.stringify({ email: account.email, password: account.password }),
        { headers: { 'Content-Type': 'application/json' } }
    );

    const loginOk = check(res, {
        'login returns 200': (r) => r.status === 200,
        'login returns user object': (r) => {
            const body = r.json() as { user?: { id: number } };
            return body?.user?.id !== undefined;
        },
    });

    if (!loginOk) {
        fail(`Login failed for ${account.email}: status=${res.status}`);
    }

    // Wyciągnij cookie z Set-Cookie header
    const setCookie = res.headers['Set-Cookie'] || '';
    const tokenMatch = setCookie.match(/token=([^;]+)/);
    const cookie = tokenMatch ? `token=${tokenMatch[1]}` : '';

    const body = res.json() as { user: { id: number; role: string } };

    return {
        cookie,
        userId: body.user.id,
        role: body.user.role,
    };
}

/**
 * Zwraca headers z cookie do authenticated requestów.
 */
export function authHeaders(token: AuthToken): Record<string, string> {
    return {
        Cookie: token.cookie,
        'Content-Type': 'application/json',
    };
}
