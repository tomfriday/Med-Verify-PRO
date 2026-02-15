import { type Page, type Locator } from '@playwright/test';

/**
 * Page Object Model for the Profile page.
 * Handles profile editing, avatar upload, and navigation.
 * All selectors use data-testid for stability.
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
        this.nameInput = page.getByTestId('profile-name');
        this.emailInput = page.getByTestId('profile-email');
        this.saveButton = page.getByTestId('profile-save');
        this.backButton = page.getByText('Wróć');
        this.avatarSection = page.getByText('Zmień zdjęcie');
        this.successAlert = page.getByTestId('profile-success');
    }

    async updateName(name: string) {
        await this.nameInput.clear();
        await this.nameInput.fill(name);
        await this.saveButton.click();
    }

    async goBack() {
        await this.backButton.click();
    }
}
