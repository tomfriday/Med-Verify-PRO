import { test, expect } from '@playwright/test';
import { loginViaAPI, ACCOUNTS } from '../helpers/auth.helper';

const BASE = 'http://localhost:3001';

test.describe('Admin API', () => {

    test('GET /api/admin/stats — requires auth', async ({ request }) => {
        const res = await request.get(`${BASE}/api/admin/stats`);
        expect(res.status()).toBe(401);
    });

    test('GET /api/admin/stats — patient gets 403', async ({ request }) => {
        const { cookie } = await loginViaAPI(request, ACCOUNTS.patient.email, ACCOUNTS.patient.password);
        const res = await request.get(`${BASE}/api/admin/stats`, {
            headers: { Cookie: cookie },
        });
        expect(res.status()).toBe(403);
    });

    test('GET /api/admin/stats — admin gets stats', async ({ request }) => {
        const { cookie } = await loginViaAPI(request, ACCOUNTS.admin.email, ACCOUNTS.admin.password);
        const res = await request.get(`${BASE}/api/admin/stats`, {
            headers: { Cookie: cookie },
        });
        expect(res.status()).toBe(200);
        const body = await res.json();
        expect(body.stats).toBeDefined();
        expect(body.stats.users).toBeDefined();
        expect(body.stats.users.total).toBeGreaterThan(0);
        expect(body.stats.users.doctors).toBeGreaterThan(0);
        expect(body.stats.users.patients).toBeGreaterThan(0);
    });

    test('GET /api/admin/audit-logs — requires admin role', async ({ request }) => {
        const { cookie: patientCookie } = await loginViaAPI(request, ACCOUNTS.patient.email, ACCOUNTS.patient.password);
        const res = await request.get(`${BASE}/api/admin/audit-logs`, {
            headers: { Cookie: patientCookie },
        });
        expect(res.status()).toBe(403);
    });

    test('GET /api/admin/audit-logs — admin gets audit logs', async ({ request }) => {
        const { cookie } = await loginViaAPI(request, ACCOUNTS.admin.email, ACCOUNTS.admin.password);
        const res = await request.get(`${BASE}/api/admin/audit-logs`, {
            headers: { Cookie: cookie },
        });
        expect(res.status()).toBe(200);
        const body = await res.json();
        expect(Array.isArray(body.logs)).toBe(true);
    });

    test('GET /api/admin/audit-logs — supports pagination', async ({ request }) => {
        const { cookie } = await loginViaAPI(request, ACCOUNTS.admin.email, ACCOUNTS.admin.password);
        const res = await request.get(`${BASE}/api/admin/audit-logs?page=1&limit=5`, {
            headers: { Cookie: cookie },
        });
        expect(res.status()).toBe(200);
        const body = await res.json();
        expect(body.logs.length).toBeLessThanOrEqual(5);
        expect(body.pagination).toBeDefined();
        expect(body.pagination.page).toBe(1);
    });
});
