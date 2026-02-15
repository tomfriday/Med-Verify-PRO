import { test, expect } from '@playwright/test';
import { loginViaAPI, ACCOUNTS } from '../helpers/auth.helper';

const BASE = 'http://localhost:3001';

test.describe('Profile API', () => {

    test('GET /api/profile — requires auth', async ({ request }) => {
        const res = await request.get(`${BASE}/api/profile`);
        expect(res.status()).toBe(401);
    });

    test('GET /api/profile — returns user data without password', async ({ request }) => {
        const { cookie } = await loginViaAPI(request, ACCOUNTS.patient.email, ACCOUNTS.patient.password);
        const res = await request.get(`${BASE}/api/profile`, {
            headers: { Cookie: cookie },
        });
        expect(res.status()).toBe(200);
        const body = await res.json();
        expect(body.user).toBeDefined();
        expect(body.user.email).toBe(ACCOUNTS.patient.email);
        expect(body.user).not.toHaveProperty('password_hash');
    });

    test('PUT /api/profile — requires auth', async ({ request }) => {
        const res = await request.put(`${BASE}/api/profile`, {
            data: { full_name: 'Test' },
        });
        expect(res.status()).toBe(401);
    });

    test('PUT /api/profile — updates user name', async ({ request }) => {
        const { cookie } = await loginViaAPI(request, ACCOUNTS.patient.email, ACCOUNTS.patient.password);

        const res = await request.put(`${BASE}/api/profile`, {
            headers: { Cookie: cookie },
            data: { full_name: 'Tomek Pacjent' },
        });
        expect(res.status()).toBe(200);
        const body = await res.json();
        expect(body.message).toContain('zaktualizowany');
    });

    test('PUT /api/profile — duplicate email returns 400', async ({ request }) => {
        const { cookie } = await loginViaAPI(request, ACCOUNTS.patient.email, ACCOUNTS.patient.password);

        const res = await request.put(`${BASE}/api/profile`, {
            headers: { Cookie: cookie },
            data: { email: ACCOUNTS.patient2.email },
        });
        expect(res.status()).toBe(400);
        const body = await res.json();
        expect(body.error).toContain('zajęty');
    });

    test('POST /api/profile/avatar — requires auth', async ({ request }) => {
        const res = await request.post(`${BASE}/api/profile/avatar`);
        expect(res.status()).toBe(401);
    });
});
