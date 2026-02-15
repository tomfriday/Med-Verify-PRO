import { test, expect } from '../fixtures';

test.describe('Doctor Dashboard E2E', () => {

    test('shows doctor role badge', async ({ doctorPage }) => {
        await expect(doctorPage.roleBadge).toBeVisible();
        await expect(doctorPage.roleBadge).toHaveText('LEKARZ');
    });

    test('dashboard loads successfully', async ({ doctorPage }) => {
        await expect(doctorPage.navbar).toBeVisible();
    });

    test('navbar avatar is visible', async ({ doctorPage }) => {
        await expect(doctorPage.navbarAvatar).toBeVisible();
    });

    test('clicking avatar navigates to profile', async ({ doctorPage, page }) => {
        await doctorPage.navigateToProfile();
        await expect(page).toHaveURL(/profile/);
    });

    test('logout works', async ({ doctorPage, page }) => {
        await doctorPage.logout();
        await expect(page.getByTestId('login-email')).toBeVisible();
    });
});
