import { test, expect } from '../fixtures';

test.describe('Profile Page E2E', () => {

    test('profile page loads with user data', async ({ profilePage, page }) => {
        await expect(page.getByText('Edycja Profilu')).toBeVisible();
        await expect(profilePage.nameInput).toHaveValue(/.+/);
    });

    test('shows avatar section', async ({ profilePage }) => {
        await expect(profilePage.avatarSection).toBeVisible();
    });

    test('email field is populated', async ({ profilePage }) => {
        await expect(profilePage.emailInput).toHaveValue(/.+@.+\..+/);
    });

    test('can update profile name', async ({ profilePage }) => {
        await profilePage.updateName('Tomek Pacjent Updated');
        await expect(profilePage.successAlert).toBeVisible();
    });

    test('back button works', async ({ profilePage, page }) => {
        await profilePage.goBack();
        await expect(page).not.toHaveURL(/profile/);
    });
});
