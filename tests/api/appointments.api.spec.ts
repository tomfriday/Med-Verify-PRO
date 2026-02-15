import { test, expect } from '@playwright/test';
import { loginViaAPI, ACCOUNTS } from '../helpers/auth.helper';

const BASE = 'http://localhost:3001';

test.describe('Appointments API', () => {

    test('GET /api/appointments — requires auth', async ({ request }) => {
        const res = await request.get(`${BASE}/api/appointments`);
        expect(res.status()).toBe(401);
    });

    test('GET /api/appointments — patient can list appointments', async ({ request }) => {
        const { cookie } = await loginViaAPI(request, ACCOUNTS.patient.email, ACCOUNTS.patient.password);
        const res = await request.get(`${BASE}/api/appointments`, {
            headers: { Cookie: cookie },
        });
        expect(res.status()).toBe(200);
        const body = await res.json();
        expect(body).toHaveProperty('appointments');
        expect(Array.isArray(body.appointments)).toBe(true);
    });

    test('POST /api/appointments — requires auth', async ({ request }) => {
        const res = await request.post(`${BASE}/api/appointments`, {
            data: { slot_id: 1 },
        });
        expect(res.status()).toBe(401);
    });

    test('POST /api/appointments — booking without valid slot_id returns error', async ({ request }) => {
        const { cookie } = await loginViaAPI(request, ACCOUNTS.patient.email, ACCOUNTS.patient.password);

        // Try booking a non-existent slot
        const res = await request.post(`${BASE}/api/appointments`, {
            headers: { Cookie: cookie },
            data: { slot_id: 999999 },
        });
        // 404 = slot not found
        expect(res.status()).toBe(404);
        const body = await res.json();
        expect(body.error).toBeTruthy();
    });

    test('POST /api/appointments — missing slot_id returns 400', async ({ request }) => {
        const { cookie } = await loginViaAPI(request, ACCOUNTS.patient.email, ACCOUNTS.patient.password);
        const res = await request.post(`${BASE}/api/appointments`, {
            headers: { Cookie: cookie },
            data: {},
        });
        expect(res.status()).toBe(400);
    });

    test('Doctor can list their appointments', async ({ request }) => {
        const { cookie } = await loginViaAPI(request, ACCOUNTS.doctor.email, ACCOUNTS.doctor.password);
        const res = await request.get(`${BASE}/api/appointments`, {
            headers: { Cookie: cookie },
        });
        expect(res.status()).toBe(200);
        const body = await res.json();
        expect(body).toHaveProperty('appointments');
        expect(Array.isArray(body.appointments)).toBe(true);
    });
});
