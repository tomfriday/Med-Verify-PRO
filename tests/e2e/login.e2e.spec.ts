import { test, expect } from '../fixtures';
import { ACCOUNTS } from '../helpers/auth.helper';

test.describe('Login E2E', () => {

    test('shows login page by default', async ({ loginPage }) => {
        await expect(loginPage.emailInput).toBeVisible();
        await expect(loginPage.passwordInput).toBeVisible();
        await expect(loginPage.submitButton).toBeVisible();
    });

    test('patient can log in and sees dashboard', async ({ loginPage, page }) => {
        await loginPage.login(ACCOUNTS.patient.email, ACCOUNTS.patient.password);
        await expect(page.getByTestId('user-role')).toHaveText('PACJENT');
    });

    test('doctor can log in and sees dashboard', async ({ loginPage, page }) => {
        await loginPage.login(ACCOUNTS.doctor.email, ACCOUNTS.doctor.password);
        await expect(page.getByTestId('user-role')).toHaveText('LEKARZ');
    });

    test('admin can log in and sees dashboard', async ({ loginPage, page }) => {
        await loginPage.login(ACCOUNTS.admin.email, ACCOUNTS.admin.password);
        await expect(page.getByTestId('user-role')).toHaveText('ADMIN');
    });

    test('invalid login shows error message', async ({ loginPage }) => {
        await loginPage.login('wrong@test.com', 'wrongpassword');
        await expect(loginPage.errorAlert).toBeVisible();
    });

    test('register link navigates to registration page', async ({ loginPage, page }) => {
        await expect(loginPage.registerLink).toBeVisible();
        await loginPage.registerLink.click();
        await expect(page).toHaveURL(/register/);
    });
});
