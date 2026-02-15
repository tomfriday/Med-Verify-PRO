import { type Page, type Locator, expect } from '@playwright/test';
import { BaseDashboard } from './BaseDashboard';

/**
 * Page Object Model for the Patient Dashboard.
 * Handles doctor search, filters, sorting, and appointment tabs.
 */
export class PatientDashboard extends BaseDashboard {
    readonly doctorCards: Locator;
    readonly specializationFilter: Locator;
    readonly sortBySelect: Locator;
    readonly sortOrderSelect: Locator;
    readonly searchInput: Locator;
    readonly tabSearch: Locator;
    readonly tabAppointments: Locator;
    readonly appointmentsTable: Locator;

    constructor(page: Page) {
        super(page);
        this.doctorCards = page.locator('.doctor-card');
        this.specializationFilter = page.getByTestId('search-specialization');
        this.sortBySelect = page.getByTestId('sort-by');
        this.sortOrderSelect = page.getByTestId('sort-order');
        this.searchInput = page.getByPlaceholder('Wpisz imię lub nazwisko...');
        this.tabSearch = page.getByTestId('tab-search');
        this.tabAppointments = page.getByTestId('tab-appointments');
        this.appointmentsTable = page.getByTestId('appointments-table');
    }

    async expectDoctorCardsVisible() {
        await expect(this.doctorCards.first()).toBeVisible({ timeout: 5000 });
    }

    async filterBySpecialization(value: string) {
        await this.expectDoctorCardsVisible();
        await this.specializationFilter.selectOption(value);
        await this.page.waitForTimeout(1500);
    }

    async searchByName(name: string) {
        await this.searchInput.fill(name);
        await this.page.waitForTimeout(800); // debounce
    }

    async sortBy(field: string, order: 'asc' | 'desc') {
        await this.sortBySelect.selectOption(field);
        await this.sortOrderSelect.selectOption(order);
        await this.page.waitForTimeout(500);
    }

    async switchToAppointmentsTab() {
        await this.tabAppointments.click();
        await expect(this.appointmentsTable).toBeVisible({ timeout: 5000 });
    }

    async getDoctorCardCount(): Promise<number> {
        return this.doctorCards.count();
    }
}
