import { test, expect } from '@playwright/test';
import { loginViaAPI, ACCOUNTS } from '../helpers/auth.helper';

const BASE = 'http://localhost:3001';

/**
 * RBAC Negative Testing — "Sprawa życia i śmierci" w systemach medycznych.
 * Verifies that users cannot access resources they don't have permissions for.
 */
test.describe('RBAC Negative Tests', () => {

    test('Patient cannot access Admin stats', async ({ request }) => {
        // Authenticate as Patient
        const { cookie } = await loginViaAPI(request, ACCOUNTS.patient.email, ACCOUNTS.patient.password);

        const res = await request.get(`${BASE}/api/admin/stats`, {
            headers: { Cookie: cookie }
        });
        // Should be 403 Forbidden
        expect(res.status(), 'Patient should not access admin stats').toBe(403);
    });

    test('Patient cannot access another patient\'s notes', async ({ request }) => {
        const { cookie } = await loginViaAPI(request, ACCOUNTS.patient.email, ACCOUNTS.patient.password);

        // Try to access a random note ID
        const res = await request.get(`${BASE}/api/appointments/notes/999`, {
            headers: { Cookie: cookie }
        });
        // 403 or 404 (depending on impl, but definitely not 200)
        expect([401, 403, 404]).toContain(res.status());
    });

    test('Doctor cannot access Admin audit logs', async ({ request }) => {
        const { cookie } = await loginViaAPI(request, ACCOUNTS.doctor.email, ACCOUNTS.doctor.password);

        const res = await request.get(`${BASE}/api/admin/audit-logs`, {
            headers: { Cookie: cookie }
        });
        expect(res.status()).toBe(403);
    });

    test('Anonymous user cannot access profile', async ({ request }) => {
        const res = await request.get(`${BASE}/api/auth/me`);
        expect(res.status()).toBe(401);
    });
});
