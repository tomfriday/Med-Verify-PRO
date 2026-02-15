import { test as base, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';
import { PatientDashboard } from './pages/PatientDashboard';
import { DoctorDashboard } from './pages/DoctorDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { ProfilePage } from './pages/ProfilePage';

/**
 * Custom Playwright Fixtures — Senior-level pattern.
 *
 * Instead of manually creating `new LoginPage(page)` in every test,
 * we extend the base `test` object with pre-built page objects.
 *
 * Usage:
 *   import { test, expect } from '../fixtures';
 *   test('my test', async ({ loginPage }) => { ... });
 */

type CustomFixtures = {
    loginPage: LoginPage;
    patientPage: PatientDashboard;
    doctorPage: DoctorDashboard;
    adminPage: AdminDashboard;
    profilePage: ProfilePage;
};

export const test = base.extend<CustomFixtures>({
    loginPage: async ({ page }, use) => {
        const loginPage = new LoginPage(page);
        await loginPage.goto();
        await use(loginPage);
    },

    patientPage: async ({ page }, use) => {
        const patientPage = new PatientDashboard(page);
        await page.goto('/');
        await use(patientPage);
    },

    doctorPage: async ({ page }, use) => {
        const doctorPage = new DoctorDashboard(page);
        await page.goto('/');
        await use(doctorPage);
    },

    adminPage: async ({ page }, use) => {
        const adminPage = new AdminDashboard(page);
        await page.goto('/');
        await use(adminPage);
    },

    profilePage: async ({ page }, use) => {
        const dashboard = new PatientDashboard(page);
        await page.goto('/');
        await dashboard.navigateToProfile();
        const profilePage = new ProfilePage(page);
        await use(profilePage);
    },
});

export { expect };
