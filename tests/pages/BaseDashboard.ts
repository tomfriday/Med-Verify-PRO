import { type Page, type Locator } from '@playwright/test';

/**
 * Base Page Object for all dashboard pages.
 * Contains shared navbar selectors and actions.
 * All selectors use data-testid for stability.
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
        this.navbarAvatar = page.getByTestId('navbar-avatar');
        this.navbarProfile = page.getByTestId('navbar-profile');
    }

    async navigateToProfile() {
        await this.navbarProfile.click();
    }

    async logout() {
        await this.logoutButton.click();
    }
}
