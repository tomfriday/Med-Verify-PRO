import { test, expect } from '@playwright/test';
import { loginViaAPI, ACCOUNTS } from '../helpers/auth.helper';

const BASE = 'http://localhost:3001';

test.describe('Doctors API', () => {

    test('GET /api/doctors — returns list of doctors', async ({ request }) => {
        const res = await request.get(`${BASE}/api/doctors`);
        expect(res.status()).toBe(200);
        const body = await res.json();
        expect(body).toHaveProperty('doctors');
        expect(Array.isArray(body.doctors)).toBe(true);
        expect(body.doctors.length).toBeGreaterThan(0);
        expect(body.doctors[0]).toHaveProperty('full_name');
        expect(body.doctors[0]).toHaveProperty('specialization');
    });

    test('GET /api/doctors?specialization=Kardiolog — filters correctly', async ({ request }) => {
        const res = await request.get(`${BASE}/api/doctors?specialization=Kardiolog`);
        expect(res.status()).toBe(200);
        const body = await res.json();
        expect(body.doctors.length).toBeGreaterThan(0);
        for (const doc of body.doctors) {
            expect(doc.specialization).toBe('Kardiolog');
        }
    });

    test('GET /api/doctors?search=Jan — search by name', async ({ request }) => {
        const res = await request.get(`${BASE}/api/doctors?search=Jan`);
        expect(res.status()).toBe(200);
        const body = await res.json();
        expect(body.doctors.length).toBeGreaterThan(0);
        const names = body.doctors.map((d: any) => d.full_name.toLowerCase());
        expect(names.some((n: string) => n.includes('jan'))).toBe(true);
    });

    test('GET /api/doctors?sortBy=price&order=asc — sorting works', async ({ request }) => {
        const res = await request.get(`${BASE}/api/doctors?sortBy=price&order=asc`);
        expect(res.status()).toBe(200);
        const body = await res.json();
        for (let i = 1; i < body.doctors.length; i++) {
            expect(body.doctors[i].price).toBeGreaterThanOrEqual(body.doctors[i - 1].price);
        }
    });

    test('GET /api/doctors?sortBy=price&order=desc — descending sort', async ({ request }) => {
        const res = await request.get(`${BASE}/api/doctors?sortBy=price&order=desc`);
        expect(res.status()).toBe(200);
        const body = await res.json();
        for (let i = 1; i < body.doctors.length; i++) {
            expect(body.doctors[i].price).toBeLessThanOrEqual(body.doctors[i - 1].price);
        }
    });

    test('GET /api/doctors/:id/slots — returns slots for a doctor', async ({ request }) => {
        // Get first doctor
        const doctorsRes = await request.get(`${BASE}/api/doctors`);
        const data = await doctorsRes.json();
        const doctorId = data.doctors[0].id;

        const res = await request.get(`${BASE}/api/doctors/${doctorId}/slots`);
        expect(res.status()).toBe(200);
        const body = await res.json();
        expect(body).toHaveProperty('slots');
        expect(Array.isArray(body.slots)).toBe(true);
    });

    test('POST /api/doctors/slots — requires authentication', async ({ request }) => {
        const res = await request.post(`${BASE}/api/doctors/slots`, {
            data: { date: '2026-03-01', time: '10:00' },
        });
        expect(res.status()).toBe(401);
    });

    test('DELETE /api/doctors/slots/:id — requires authentication', async ({ request }) => {
        const res = await request.delete(`${BASE}/api/doctors/slots/999`);
        expect(res.status()).toBe(401);
    });
});
