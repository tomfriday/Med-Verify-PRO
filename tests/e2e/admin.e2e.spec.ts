import { test, expect } from '../fixtures';

test.describe('Admin Dashboard E2E', () => {

    test('shows admin role badge', async ({ adminPage }) => {
        await expect(adminPage.roleBadge).toBeVisible();
        await expect(adminPage.roleBadge).toHaveText('ADMIN');
    });

    test('displays system statistics', async ({ adminPage }) => {
        await expect(adminPage.statTotalUsers).toBeVisible();
        await expect(adminPage.statDoctors).toBeVisible();
        await expect(adminPage.statPatients).toBeVisible();
    });

    test('displays audit log entries', async ({ adminPage }) => {
        await adminPage.switchToLogsTab();
        await expect(adminPage.auditLogRows.first()).toBeVisible({ timeout: 15000 });
    });

    test('navbar avatar is visible', async ({ adminPage }) => {
        await expect(adminPage.navbarAvatar).toBeVisible();
    });

    test('clicking avatar navigates to profile', async ({ adminPage, page }) => {
        await adminPage.navigateToProfile();
        await expect(page).toHaveURL(/profile/);
    });

    test('logout works', async ({ adminPage, page }) => {
        await adminPage.logout();
        await expect(page.getByTestId('login-email')).toBeVisible();
    });
});
