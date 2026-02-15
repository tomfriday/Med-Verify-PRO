import { type Page, type Locator } from '@playwright/test';

/**
 * Page Object Model for the Login page.
 * Encapsulates all selectors and actions for /login.
 * All selectors use data-testid for stability.
 */
export class LoginPage {
    readonly page: Page;
    readonly emailInput: Locator;
    readonly passwordInput: Locator;
    readonly submitButton: Locator;
    readonly errorAlert: Locator;
    readonly registerLink: Locator;

    constructor(page: Page) {
        this.page = page;
        this.emailInput = page.getByTestId('login-email');
        this.passwordInput = page.getByTestId('login-password');
        this.submitButton = page.getByTestId('login-submit');
        this.errorAlert = page.getByTestId('login-error');
        this.registerLink = page.getByText('Zarejestruj się');
    }

    async goto() {
        await this.page.goto('/');
    }

    async fillLoginForm(email: string, password: string) {
        await this.emailInput.fill(email);
        await this.passwordInput.fill(password);
    }

    async submit() {
        await this.submitButton.click();
    }

    async login(email: string, password: string) {
        await this.fillLoginForm(email, password);
        await this.submit();
    }
}
