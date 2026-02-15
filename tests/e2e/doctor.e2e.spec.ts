import { test, expect, Page } from '@playwright/test';
import { ACCOUNTS } from '../helpers/auth.helper';

async function loginAsDoctor(page: Page) {
    await page.goto('/');
    await page.getByTestId('login-email').fill(ACCOUNTS.doctor.email);
    await page.getByTestId('login-password').fill(ACCOUNTS.doctor.password);
    await page.getByTestId('login-submit').click();
    await expect(page.getByTestId('user-role')).toBeVisible({ timeout: 5000 });
}

test.describe('Doctor Dashboard E2E', () => {

    test.beforeEach(async ({ page }) => {
        await loginAsDoctor(page);
    });

    test('shows doctor role badge', async ({ page }) => {
        await expect(page.getByTestId('user-role')).toHaveText('LEKARZ');
    });

    test('dashboard loads successfully', async ({ page }) => {
        await expect(page.locator('.navbar')).toBeVisible({ timeout: 5000 });
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
