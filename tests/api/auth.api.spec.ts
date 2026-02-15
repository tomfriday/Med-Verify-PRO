import { test, expect } from '@playwright/test';
import { ACCOUNTS } from '../helpers/auth.helper';

const BASE = 'http://localhost:3001';

test.describe('Auth API', () => {

    test('GET /api/health returns ok', async ({ request }) => {
        const res = await request.get(`${BASE}/api/health`);
        expect(res.status()).toBe(200);
        const body = await res.json();
        expect(body.status).toBe('ok');
    });

    test('POST /api/auth/login — valid credentials return user object', async ({ request }) => {
        const res = await request.post(`${BASE}/api/auth/login`, {
            data: { email: ACCOUNTS.patient.email, password: ACCOUNTS.patient.password },
        });
        expect(res.status()).toBe(200);
        const body = await res.json();
        expect(body.user).toBeDefined();
        expect(body.user.email).toBe(ACCOUNTS.patient.email);
        expect(body.user.role).toBe('PATIENT');
    });

    test('POST /api/auth/login — invalid credentials return 401', async ({ request }) => {
        const res = await request.post(`${BASE}/api/auth/login`, {
            data: { email: 'wrong@test.com', password: 'wrong' },
        });
        expect(res.status()).toBe(401);
        const body = await res.json();
        expect(body.error).toBeTruthy();
    });

    test('POST /api/auth/login — missing fields return 400', async ({ request }) => {
        const res = await request.post(`${BASE}/api/auth/login`, {
            data: { email: '' },
        });
        expect(res.status()).toBe(400);
    });

    test('POST /api/auth/login sets httpOnly cookie', async ({ request }) => {
        const res = await request.post(`${BASE}/api/auth/login`, {
            data: { email: ACCOUNTS.patient.email, password: ACCOUNTS.patient.password },
        });
        const setCookie = res.headers()['set-cookie'] || '';
        expect(setCookie).toContain('token=');
        expect(setCookie.toLowerCase()).toContain('httponly');
    });

    test('GET /api/auth/me — without token returns 401', async ({ request }) => {
        const res = await request.get(`${BASE}/api/auth/me`);
        expect(res.status()).toBe(401);
    });

    test('GET /api/auth/me — with token returns user data', async ({ request }) => {
        const loginRes = await request.post(`${BASE}/api/auth/login`, {
            data: { email: ACCOUNTS.patient.email, password: ACCOUNTS.patient.password },
        });
        const setCookie = loginRes.headers()['set-cookie'] || '';
        const tokenMatch = setCookie.match(/token=([^;]+)/);
        const cookie = tokenMatch ? `token=${tokenMatch[1]}` : '';

        const meRes = await request.get(`${BASE}/api/auth/me`, {
            headers: { Cookie: cookie },
        });
        expect(meRes.status()).toBe(200);
        const body = await meRes.json();
        expect(body.user.email).toBe(ACCOUNTS.patient.email);
        expect(body.user.role).toBe('PATIENT');
        expect(body.user.full_name).toBeTruthy();
    });

    test('POST /api/auth/register — duplicate email returns 409', async ({ request }) => {
        const res = await request.post(`${BASE}/api/auth/register`, {
            data: { email: ACCOUNTS.patient.email, password: 'test123', full_name: 'Duplicate' },
        });
        expect(res.status()).toBe(409);
    });

    test('POST /api/auth/register — missing fields returns 400', async ({ request }) => {
        const res = await request.post(`${BASE}/api/auth/register`, {
            data: { email: 'newuser@test.com' },
        });
        expect(res.status()).toBe(400);
    });

    test('POST /api/auth/logout clears cookie', async ({ request }) => {
        const res = await request.post(`${BASE}/api/auth/logout`);
        expect(res.status()).toBe(200);
        const body = await res.json();
        expect(body.message).toContain('Wylogowano');
    });
});
