import { test, expect } from '@playwright/test';
import { ACCOUNTS } from '../helpers/auth.helper';

test.describe('Login E2E', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('shows login page by default', async ({ page }) => {
        await expect(page.getByTestId('login-email')).toBeVisible();
        await expect(page.getByTestId('login-password')).toBeVisible();
        await expect(page.getByTestId('login-submit')).toBeVisible();
    });

    test('patient can log in and sees dashboard', async ({ page }) => {
        await page.getByTestId('login-email').fill(ACCOUNTS.patient.email);
        await page.getByTestId('login-password').fill(ACCOUNTS.patient.password);
        await page.getByTestId('login-submit').click();

        await expect(page.getByTestId('user-role')).toBeVisible({ timeout: 5000 });
        await expect(page.getByTestId('user-role')).toHaveText('PACJENT');
    });

    test('doctor can log in and sees dashboard', async ({ page }) => {
        await page.getByTestId('login-email').fill(ACCOUNTS.doctor.email);
        await page.getByTestId('login-password').fill(ACCOUNTS.doctor.password);
        await page.getByTestId('login-submit').click();

        await expect(page.getByTestId('user-role')).toBeVisible({ timeout: 5000 });
        await expect(page.getByTestId('user-role')).toHaveText('LEKARZ');
    });

    test('admin can log in and sees dashboard', async ({ page }) => {
        await page.getByTestId('login-email').fill(ACCOUNTS.admin.email);
        await page.getByTestId('login-password').fill(ACCOUNTS.admin.password);
        await page.getByTestId('login-submit').click();

        await expect(page.getByTestId('user-role')).toBeVisible({ timeout: 5000 });
        await expect(page.getByTestId('user-role')).toHaveText('ADMIN');
    });

    test('invalid login shows error message', async ({ page }) => {
        await page.getByTestId('login-email').fill('wrong@test.com');
        await page.getByTestId('login-password').fill('wrongpassword');
        await page.getByTestId('login-submit').click();

        await expect(page.locator('.alert-error')).toBeVisible({ timeout: 5000 });
    });

    test('logout button works', async ({ page }) => {
        await page.getByTestId('login-email').fill(ACCOUNTS.patient.email);
        await page.getByTestId('login-password').fill(ACCOUNTS.patient.password);
        await page.getByTestId('login-submit').click();

        await expect(page.getByTestId('logout-btn')).toBeVisible({ timeout: 5000 });
        await page.getByTestId('logout-btn').click();

        await expect(page.getByTestId('login-email')).toBeVisible({ timeout: 5000 });
    });

    test('register link navigates to registration page', async ({ page }) => {
        const registerLink = page.getByText('Zarejestruj się');
        await expect(registerLink).toBeVisible();
        await registerLink.click();
        await expect(page).toHaveURL(/register/);
    });
});
