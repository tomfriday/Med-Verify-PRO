import { test, expect } from '@playwright/test';
import { ProfilePage } from '../pages/ProfilePage';
import { PatientDashboard } from '../pages/PatientDashboard';

test.describe('Profile Page E2E', () => {
    let profilePage: ProfilePage;
    let dashboard: PatientDashboard;

    test.beforeEach(async ({ page }) => {
        dashboard = new PatientDashboard(page);
        await dashboard.page.goto('/');
        await dashboard.navigateToProfile();
        profilePage = new ProfilePage(page);
    });

    test('profile page loads with user data', async () => {
        await profilePage.expectProfileLoaded();
    });

    test('shows avatar section', async () => {
        await expect(profilePage.avatarSection).toBeVisible();
    });

    test('email field is populated', async () => {
        // We assume the user is the one from auth.setup.ts
        await expect(profilePage.emailInput).toHaveValue(/.+@.+\..+/);
    });

    test('can update profile name', async () => {
        await profilePage.updateName('Tomek Pacjent Updated');
    });

    test('back button works', async () => {
        await profilePage.goBack();
    });
});
