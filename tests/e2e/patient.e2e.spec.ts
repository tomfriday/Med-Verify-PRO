import { test, expect } from '../fixtures';

test.describe('Patient Dashboard E2E', () => {

    test('shows doctor cards', async ({ patientPage }) => {
        await expect(patientPage.doctorCards.first()).toBeVisible({ timeout: 5000 });
    });

    test('specialization filter works', async ({ patientPage }) => {
        await patientPage.filterBySpecialization('Kardiolog');
        const count = await patientPage.getDoctorCardCount();
        expect(count).toBeGreaterThan(0);
    });

    test('search by doctor name works', async ({ patientPage }) => {
        await patientPage.searchByName('Kowalski');
        await expect(patientPage.doctorCards.first()).toBeVisible();
    });

    test('sort direction toggle works', async ({ patientPage }) => {
        await patientPage.sortBy('price', 'desc');
        const count = await patientPage.getDoctorCardCount();
        expect(count).toBeGreaterThan(0);
    });

    test('can switch to "Moje Wizyty" tab', async ({ patientPage }) => {
        await patientPage.switchToAppointmentsTab();
        await expect(patientPage.appointmentsTable).toBeVisible();
    });

    test('navbar avatar is visible', async ({ patientPage }) => {
        await expect(patientPage.navbarAvatar).toBeVisible();
    });

    test('clicking avatar navigates to profile', async ({ patientPage, page }) => {
        await patientPage.navigateToProfile();
        await expect(page).toHaveURL(/profile/);
    });
});
