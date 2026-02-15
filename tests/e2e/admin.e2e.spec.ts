import { test, expect, Page } from '@playwright/test';
import { ACCOUNTS } from '../helpers/auth.helper';

async function loginAsAdmin(page: Page) {
    await page.goto('/');
    await page.getByTestId('login-email').fill(ACCOUNTS.admin.email);
    await page.getByTestId('login-password').fill(ACCOUNTS.admin.password);
    await page.getByTestId('login-submit').click();
    await expect(page.getByTestId('user-role')).toBeVisible({ timeout: 5000 });
}

test.describe('Admin Dashboard E2E', () => {

    test.beforeEach(async ({ page }) => {
        await loginAsAdmin(page);
    });

    test('shows admin role badge', async ({ page }) => {
        await expect(page.getByTestId('user-role')).toHaveText('ADMIN');
    });

    test('displays system statistics', async ({ page }) => {
        await expect(page.getByTestId('stat-total-users')).toBeVisible({ timeout: 5000 });
        await expect(page.getByTestId('stat-doctors')).toBeVisible();
        await expect(page.getByTestId('stat-patients')).toBeVisible();
    });

    test('displays audit log entries', async ({ page }) => {
        // Switch to logs tab (default is stats)
        await page.getByTestId('tab-logs').click();
        await page.waitForTimeout(1000);
        const logRows = page.locator('[data-testid^="audit-log-row"]');
        await expect(logRows.first()).toBeVisible({ timeout: 15000 });
    });

    test('navbar avatar is visible', async ({ page }) => {
        await expect(page.locator('.navbar-avatar')).toBeVisible();
    });

    test('clicking avatar navigates to profile', async ({ page }) => {
        await page.locator('.navbar-profile').click();
        await expect(page).toHaveURL(/profile/);
    });

    test('logout works', async ({ page }) => {
        await page.getByTestId('logout-btn').click();
        await expect(page.getByTestId('login-email')).toBeVisible({ timeout: 5000 });
    });
});
