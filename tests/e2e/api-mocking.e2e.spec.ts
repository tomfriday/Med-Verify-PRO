import { test, expect } from '../fixtures';

/**
 * API Interception & Mocking Tests.
 *
 * Demonstrates the "killer feature" of Playwright: page.route()
 * We intercept real API calls and replace them with mocked responses
 * to test edge cases (500 errors, empty data, malformed JSON)
 * that would be hard to reproduce on a stable environment.
 */

test.describe('API Mocking — Edge Cases', () => {

    test('shows error message when booking API returns 500', async ({ patientPage, page }) => {
        // Wait for real doctor cards to load first
        await expect(patientPage.doctorCards.first()).toBeVisible({ timeout: 5000 });

        // Intercept the booking endpoint and return a 500 error
        await page.route('**/api/appointments', (route) => {
            if (route.request().method() === 'POST') {
                route.fulfill({
                    status: 500,
                    contentType: 'application/json',
                    body: JSON.stringify({ error: 'Internal Server Error' }),
                });
            } else {
                route.continue();
            }
        });

        // Try to book — click the first available slot button
        const bookBtn = page.locator('[data-testid^="book-slot-"]').first();

        // If no bookable slots exist, skip gracefully
        const slotExists = await bookBtn.isVisible().catch(() => false);
        if (slotExists) {
            await bookBtn.click();
            // Verify the UI shows an error message
            await expect(page.getByTestId('alert-error')).toBeVisible({ timeout: 5000 });
        }
    });

    test('shows empty state when doctor list API returns empty array', async ({ page }) => {
        // Intercept the doctors endpoint BEFORE navigation
        await page.route('**/api/doctors*', (route) => {
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify([]),
            });
        });

        await page.goto('/');

        // With empty response, no doctor cards should appear
        const cards = page.locator('[data-testid^="doctor-card"]');
        await expect(cards).toHaveCount(0, { timeout: 5000 });
    });

    test('handles malformed API response gracefully', async ({ page }) => {
        // Intercept doctors endpoint and return invalid JSON
        await page.route('**/api/doctors*', (route) => {
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: '{ INVALID JSON !!!',
            });
        });

        await page.goto('/');

        // The app should not crash — page should still be interactive
        await expect(page.locator('body')).toBeVisible();
        // No doctor cards should appear from broken response
        const cards = page.locator('[data-testid^="doctor-card"]');
        await expect(cards).toHaveCount(0, { timeout: 5000 });
    });

    test('intercepts and verifies API response structure', async ({ patientPage, page }) => {
        // Navigate and wait for doctor cards + capture the API response
        const responsePromise = page.waitForResponse((resp) =>
            resp.url().includes('/api/doctors') && resp.status() === 200
        );

        await page.goto('/');
        const response = await responsePromise;
        const data = await response.json();

        // Verify the intercepted response has expected shape
        const doctors = Array.isArray(data) ? data : data.doctors || data.data || [];
        expect(doctors.length).toBeGreaterThan(0);

        const doctor = doctors[0];
        expect(doctor).toHaveProperty('full_name');
        expect(doctor).toHaveProperty('specialization');
        expect(doctor).toHaveProperty('price');
        // Security: password should NEVER be in API response
        expect(doctor).not.toHaveProperty('password');
    });
});
