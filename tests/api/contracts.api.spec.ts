import { test, expect } from '@playwright/test';
import { loginViaAPI, ACCOUNTS } from '../helpers/auth.helper';

const BASE = 'http://localhost:3001';

/**
 * Contract & Security Testing.
 * Verifies JSON structure and ensures no sensitive data leaks (PD - passwords).
 */
test.describe('API Contract & Security Tests', () => {

    test('GET /api/auth/me returns correct JSON structure without password', async ({ request }) => {
        const { cookie } = await loginViaAPI(request, ACCOUNTS.patient.email, ACCOUNTS.patient.password);
        const res = await request.get(`${BASE}/api/auth/me`, { headers: { Cookie: cookie } });
        const body = await res.json();

        // Contract check
        expect(body).toHaveProperty('id');
        expect(body).toHaveProperty('email');
        expect(body).toHaveProperty('role');
        expect(body).toHaveProperty('full_name');

        // Security check
        expect(body).not.toHaveProperty('password');
        expect(body).not.toHaveProperty('hash');
        expect(body).not.toHaveProperty('salt');
    });

    test('GET /api/doctors returns doctors without sensitive data', async ({ request }) => {
        const res = await request.get(`${BASE}/api/doctors`);
        const body = await res.json();
        const doctor = body.doctors[0];

        expect(doctor).toHaveProperty('id');
        expect(doctor).toHaveProperty('full_name');
        expect(doctor).toHaveProperty('specialization');

        // Security: Public endpoint shouldn't leak emails or IDs that aren't public
        expect(doctor).not.toHaveProperty('password');
        expect(doctor).not.toHaveProperty('email'); // Maybe emails are private? checking just in case
        expect(doctor).not.toHaveProperty('created_at'); // Implementation detail
    });

    test('Error responses follow standard format', async ({ request }) => {
        // Force 400 error
        const res = await request.post(`${BASE}/api/auth/login`, { data: {} });
        const body = await res.json();

        expect(res.status()).toBe(400);
        expect(body).toHaveProperty('error');
    });
});
