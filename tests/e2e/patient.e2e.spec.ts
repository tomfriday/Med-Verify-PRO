import { test, expect } from '@playwright/test';
import { PatientDashboard } from '../pages/PatientDashboard';

test.describe('Patient Dashboard E2E', () => {
    let patientPage: PatientDashboard;

    test.beforeEach(async ({ page }) => {
        patientPage = new PatientDashboard(page);
        await patientPage.page.goto('/');
    });

    test('shows doctor cards', async () => {
        await patientPage.expectDoctorCardsVisible();
    });

    test('specialization filter works', async () => {
        await patientPage.filterBySpecialization('Kardiolog');
        const count = await patientPage.getDoctorCardCount();
        expect(count).toBeGreaterThan(0);
    });

    test('search by doctor name works', async () => {
        await patientPage.searchByName('Kowalski');
        await patientPage.expectDoctorCardsVisible();
    });

    test('sort direction toggle works', async () => {
        await patientPage.sortBy('price', 'desc');
        const count = await patientPage.getDoctorCardCount();
        expect(count).toBeGreaterThan(0);
    });

    test('can switch to "Moje Wizyty" tab', async () => {
        await patientPage.switchToAppointmentsTab();
    });

    test('navbar avatar is visible', async () => {
        await patientPage.expectNavbarAvatarVisible();
    });

    test('clicking avatar navigates to profile', async () => {
        await patientPage.navigateToProfile();
    });
});
