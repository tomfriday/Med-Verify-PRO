import { test, expect } from '@playwright/test';
import { PatientDashboard } from '../pages/PatientDashboard';

/**
 * Data-Driven Testing for Doctor Search.
 * Verifies that the specialization filter works correctly for multiple categories.
 */

const SPECIALIZATIONS = [
    { label: 'Kardiolog', expectedCount: 1 }, // Adjust expected counts based on seed data
    { label: 'Internista', expectedCount: 1 },
    { label: 'Neurolog', expectedCount: 1 },
    { label: 'Dermatolog', expectedCount: 1 }, // Assuming seed has this
];

test.describe('Doctor Search Data-Driven', () => {
    let patientPage: PatientDashboard;

    test.beforeEach(async ({ page }) => {
        patientPage = new PatientDashboard(page);
        await patientPage.page.goto('/');
    });

    for (const spec of SPECIALIZATIONS) {
        test(`filters by ${spec.label}`, async () => {
            await patientPage.filterBySpecialization(spec.label);
            const count = await patientPage.getDoctorCardCount();
            expect(count, `Should find at least ${spec.expectedCount} ${spec.label}`).toBeGreaterThanOrEqual(spec.expectedCount);
        });
    }
});
