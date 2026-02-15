import { type Page, type Locator, expect } from '@playwright/test';

/**
 * Page Object Model for the Profile page.
 * Handles profile editing, avatar upload, and navigation.
 */
export class ProfilePage {
    readonly page: Page;
    readonly nameInput: Locator;
    readonly emailInput: Locator;
    readonly saveButton: Locator;
    readonly backButton: Locator;
    readonly avatarSection: Locator;
    readonly successAlert: Locator;

    constructor(page: Page) {
        this.page = page;
        this.nameInput = page.locator('input[type="text"]').first();
        this.emailInput = page.locator('input[type="email"]');
        this.saveButton = page.getByText('Zapisz zmiany');
        this.backButton = page.getByText('Wróć');
        this.avatarSection = page.getByText('Zmień zdjęcie');
        this.successAlert = page.locator('.alert-success');
    }

    async expectProfileLoaded() {
        await expect(this.page.getByText('Edycja Profilu')).toBeVisible();
        await expect(this.nameInput).toHaveValue(/.+/);
    }

    async updateName(name: string) {
        await this.nameInput.clear();
        await this.nameInput.fill(name);
        await this.saveButton.click();
        await expect(this.successAlert).toBeVisible({ timeout: 5000 });
    }

    async goBack() {
        await this.backButton.click();
        await this.page.waitForTimeout(500);
        await expect(this.page).not.toHaveURL(/profile/);
    }
}
