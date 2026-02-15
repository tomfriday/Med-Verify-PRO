import { test, expect, Page } from '@playwright/test';
import { ACCOUNTS } from '../helpers/auth.helper';

async function loginAsPatient(page: Page) {
    await page.goto('/');
    await page.getByTestId('login-email').fill(ACCOUNTS.patient.email);
    await page.getByTestId('login-password').fill(ACCOUNTS.patient.password);
    await page.getByTestId('login-submit').click();
    await expect(page.getByTestId('user-role')).toBeVisible({ timeout: 5000 });
}

test.describe('Profile Page E2E', () => {

    test.beforeEach(async ({ page }) => {
        await loginAsPatient(page);
        await page.locator('.navbar-profile').click();
        await expect(page).toHaveURL(/profile/, { timeout: 5000 });
    });

    test('profile page loads with user data', async ({ page }) => {
        await expect(page.getByText('Edycja Profilu')).toBeVisible();
        const nameInput = page.locator('input[type="text"]').first();
        await expect(nameInput).toHaveValue(/.+/);
    });

    test('shows avatar section', async ({ page }) => {
        await expect(page.getByText('Zmień zdjęcie')).toBeVisible();
    });

    test('email field is populated', async ({ page }) => {
        const emailInput = page.locator('input[type="email"]');
        await expect(emailInput).toHaveValue(ACCOUNTS.patient.email);
    });

    test('can update profile name', async ({ page }) => {
        const nameInput = page.locator('input[type="text"]').first();
        await nameInput.clear();
        await nameInput.fill('Tomek Pacjent');

        await page.getByText('Zapisz zmiany').click();
        await expect(page.locator('.alert-success')).toBeVisible({ timeout: 5000 });
    });

    test('back button works', async ({ page }) => {
        await page.getByText('Wróć').click();
        await page.waitForTimeout(500);
        await expect(page).not.toHaveURL(/profile/);
    });
});
