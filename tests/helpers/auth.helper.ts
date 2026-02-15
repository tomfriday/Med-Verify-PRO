import { APIRequestContext } from '@playwright/test';

const API_URL = 'http://localhost:3001';

export interface LoginResponse {
    user: {
        id: number;
        email: string;
        role: string;
        full_name: string;
    };
}

/**
 * Logs in via API and returns the auth cookie token.
 */
export async function loginViaAPI(
    request: APIRequestContext,
    email: string,
    password: string
): Promise<{ cookie: string; user: LoginResponse['user'] }> {
    const res = await request.post(`${API_URL}/api/auth/login`, {
        data: { email, password },
    });
    const data = await res.json();
    const setCookie = res.headers()['set-cookie'] || '';
    const tokenMatch = setCookie.match(/token=([^;]+)/);
    const cookie = tokenMatch ? `token=${tokenMatch[1]}` : '';
    return { cookie, user: data.user };
}

/** Test accounts */
export const ACCOUNTS = {
    patient: { email: 'patient1@test.com', password: 'password123' },
    patient2: { email: 'patient2@test.com', password: 'password123' },
    doctor: { email: 'jan.kowalski@medverify.com', password: 'password123' },
    admin: { email: 'admin@medverify.com', password: 'password123' },
} as const;
