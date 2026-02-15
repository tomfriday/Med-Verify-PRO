import { test, expect, Page } from '@playwright/test';
import { ACCOUNTS } from '../helpers/auth.helper';

async function loginAsPatient(page: Page) {
    await page.goto('/');
    await page.getByTestId('login-email').fill(ACCOUNTS.patient.email);
    await page.getByTestId('login-password').fill(ACCOUNTS.patient.password);
    await page.getByTestId('login-submit').click();
    await expect(page.getByTestId('user-role')).toBeVisible({ timeout: 5000 });
}

test.describe('Patient Dashboard E2E', () => {

    test.beforeEach(async ({ page }) => {
        await loginAsPatient(page);
    });

    test('shows doctor cards', async ({ page }) => {
        await expect(page.locator('.doctor-card').first()).toBeVisible({ timeout: 5000 });
    });

    test('specialization filter works', async ({ page }) => {
        // Wait for initial load
        await expect(page.locator('.doctor-card').first()).toBeVisible({ timeout: 5000 });

        await page.getByTestId('search-specialization').selectOption('Kardiolog');
        // Wait for re-render
        await page.waitForTimeout(2000);

        const cards = page.locator('.doctor-card');
        expect(await cards.count()).toBeGreaterThan(0);
    });

    test('search by doctor name works', async ({ page }) => {
        const searchInput = page.getByPlaceholder('Wpisz imię lub nazwisko...');
        await searchInput.fill('Kowalski');
        await page.waitForTimeout(800); // debounce

        const cards = page.locator('.doctor-card');
        await expect(cards.first()).toBeVisible({ timeout: 3000 });
    });

    test('sort direction toggle works', async ({ page }) => {
        await page.getByTestId('sort-by').selectOption('price');
        await page.getByTestId('sort-order').selectOption('desc');
        await page.waitForTimeout(500);

        const cards = page.locator('.doctor-card');
        expect(await cards.count()).toBeGreaterThan(0);
    });

    test('can switch to "Moje Wizyty" tab', async ({ page }) => {
        await page.getByTestId('tab-appointments').click();
        await page.waitForTimeout(500);

        // Should display appointments table
        await expect(page.getByTestId('appointments-table')).toBeVisible({ timeout: 5000 });
    });

    test('navbar avatar is visible', async ({ page }) => {
        await expect(page.locator('.navbar-avatar')).toBeVisible();
    });

    test('clicking avatar navigates to profile', async ({ page }) => {
        await page.locator('.navbar-profile').click();
        await expect(page).toHaveURL(/profile/);
    });
});
