import { test as setup, expect } from '@playwright/test';
import { ACCOUNTS } from './helpers/auth.helper';
import { LoginPage } from './pages/LoginPage';
import path from 'path';

/**
 * Auth Setup — logs in once per role and saves browser storageState to JSON files.
 * All E2E tests that depend on a specific role will reuse the saved session,
 * eliminating repeated login overhead and simulating MFA-reuse patterns.
 */

const AUTH_DIR = path.join(__dirname, '.auth');

setup.describe('Authentication Setup', () => {

    setup.beforeAll(async ({ request }) => {
        // Reset database to seed state before running any tests
        const res = await request.post('http://localhost:3001/api/test/reset');
        expect(res.status()).toBe(200);
        console.log('Database reset to seed state.');
    });

    setup('authenticate as Patient', async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.goto();
        await loginPage.login(ACCOUNTS.patient.email, ACCOUNTS.patient.password);
        await expect(page.getByTestId('user-role')).toBeVisible({ timeout: 5000 });
        await expect(page.getByTestId('user-role')).toHaveText('PACJENT');

        await page.context().storageState({ path: path.join(AUTH_DIR, 'patient.json') });
    });

    setup('authenticate as Doctor', async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.goto();
        await loginPage.login(ACCOUNTS.doctor.email, ACCOUNTS.doctor.password);
        await expect(page.getByTestId('user-role')).toBeVisible({ timeout: 5000 });
        await expect(page.getByTestId('user-role')).toHaveText('LEKARZ');

        await page.context().storageState({ path: path.join(AUTH_DIR, 'doctor.json') });
    });

    setup('authenticate as Admin', async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.goto();
        await loginPage.login(ACCOUNTS.admin.email, ACCOUNTS.admin.password);
        await expect(page.getByTestId('user-role')).toBeVisible({ timeout: 5000 });
        await expect(page.getByTestId('user-role')).toHaveText('ADMIN');

        await page.context().storageState({ path: path.join(AUTH_DIR, 'admin.json') });
    });
});
