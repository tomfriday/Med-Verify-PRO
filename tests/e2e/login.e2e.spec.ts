import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { ACCOUNTS } from '../helpers/auth.helper';

test.describe('Login E2E', () => {
    let loginPage: LoginPage;

    test.beforeEach(async ({ page }) => {
        loginPage = new LoginPage(page);
        await loginPage.goto();
    });

    test('shows login page by default', async () => {
        await loginPage.expectLoginPageVisible();
    });

    test('patient can log in and sees dashboard', async ({ page }) => {
        await loginPage.login(ACCOUNTS.patient.email, ACCOUNTS.patient.password);
        await expect(page.getByTestId('user-role')).toHaveText('PACJENT');
    });

    test('doctor can log in and sees dashboard', async ({ page }) => {
        await loginPage.login(ACCOUNTS.doctor.email, ACCOUNTS.doctor.password);
        await expect(page.getByTestId('user-role')).toHaveText('LEKARZ');
    });

    test('admin can log in and sees dashboard', async ({ page }) => {
        await loginPage.login(ACCOUNTS.admin.email, ACCOUNTS.admin.password);
        await expect(page.getByTestId('user-role')).toHaveText('ADMIN');
    });

    test('invalid login shows error message', async () => {
        await loginPage.login('wrong@test.com', 'wrongpassword');
        await loginPage.expectErrorVisible();
    });

    test('register link navigates to registration page', async ({ page }) => {
        await expect(loginPage.registerLink).toBeVisible();
        await loginPage.registerLink.click();
        await expect(page).toHaveURL(/register/);
    });
});
