import { test, expect } from '../fixtures';

/**
 * Data-Driven Testing for Doctor Search.
 * Verifies that the specialization filter works correctly for multiple categories.
 */

const SPECIALIZATIONS = [
    { label: 'Kardiolog', expectedCount: 1 },
    { label: 'Internista', expectedCount: 1 },
    { label: 'Neurolog', expectedCount: 1 },
];

test.describe('Doctor Search Data-Driven', () => {

    for (const spec of SPECIALIZATIONS) {
        test(`filters by ${spec.label}`, async ({ patientPage }) => {
            await patientPage.filterBySpecialization(spec.label);
            await expect(patientPage.doctorCards.first()).toBeVisible();
            const count = await patientPage.getDoctorCardCount();
            expect(count, `Should find at least ${spec.expectedCount} ${spec.label}`).toBeGreaterThanOrEqual(spec.expectedCount);
        });
    }
});
