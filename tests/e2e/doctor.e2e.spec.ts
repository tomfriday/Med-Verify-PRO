import { test } from '@playwright/test';
import { DoctorDashboard } from '../pages/DoctorDashboard';

test.describe('Doctor Dashboard E2E', () => {
    let doctorPage: DoctorDashboard;

    test.beforeEach(async ({ page }) => {
        doctorPage = new DoctorDashboard(page);
        await doctorPage.page.goto('/');
    });

    test('shows doctor role badge', async () => {
        await doctorPage.expectRoleBadge('LEKARZ');
    });

    test('dashboard loads successfully', async () => {
        await doctorPage.expectDashboardLoaded();
    });

    test('navbar avatar is visible', async () => {
        await doctorPage.expectNavbarAvatarVisible();
    });

    test('clicking avatar navigates to profile', async () => {
        await doctorPage.navigateToProfile();
    });

    test('logout works', async () => {
        await doctorPage.logout();
    });
});
