import { type Page, type Locator, expect } from '@playwright/test';

/**
 * Base Page Object for all dashboard pages.
 * Contains shared navbar selectors and actions.
 */
export class BaseDashboard {
    readonly page: Page;
    readonly roleBadge: Locator;
    readonly logoutButton: Locator;
    readonly navbarAvatar: Locator;
    readonly navbarProfile: Locator;

    constructor(page: Page) {
        this.page = page;
        this.roleBadge = page.getByTestId('user-role');
        this.logoutButton = page.getByTestId('logout-btn');
        this.navbarAvatar = page.locator('.navbar-avatar');
        this.navbarProfile = page.locator('.navbar-profile');
    }

    async expectRoleBadge(text: string) {
        await expect(this.roleBadge).toBeVisible({ timeout: 5000 });
        await expect(this.roleBadge).toHaveText(text);
    }

    async expectNavbarAvatarVisible() {
        await expect(this.navbarAvatar).toBeVisible();
    }

    async navigateToProfile() {
        await this.navbarProfile.click();
        await expect(this.page).toHaveURL(/profile/);
    }

    async logout() {
        await this.logoutButton.click();
        await expect(this.page.getByTestId('login-email')).toBeVisible({ timeout: 5000 });
    }
}
