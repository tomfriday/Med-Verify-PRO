import { type Page, type Locator } from '@playwright/test';
import { BaseDashboard } from './BaseDashboard';

/**
 * Page Object Model for the Patient Dashboard.
 * Handles doctor search, filters, sorting, and appointment tabs.
 * All selectors use data-testid for stability.
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
        this.doctorCards = page.locator('[data-testid^="doctor-card"]');
        this.specializationFilter = page.getByTestId('search-specialization');
        this.sortBySelect = page.getByTestId('sort-by');
        this.sortOrderSelect = page.getByTestId('sort-order');
        this.searchInput = page.getByTestId('search-name');
        this.tabSearch = page.getByTestId('tab-search');
        this.tabAppointments = page.getByTestId('tab-appointments');
        this.appointmentsTable = page.getByTestId('appointments-table');
    }

    async filterBySpecialization(value: string) {
        await this.specializationFilter.selectOption(value);
        await this.page.waitForTimeout(1500);
    }

    async searchByName(name: string) {
        await this.searchInput.fill(name);
        await this.page.waitForTimeout(800);
    }

    async sortBy(field: string, order: 'asc' | 'desc') {
        await this.sortBySelect.selectOption(field);
        await this.sortOrderSelect.selectOption(order);
        await this.page.waitForTimeout(500);
    }

    async switchToAppointmentsTab() {
        await this.tabAppointments.click();
    }

    async getDoctorCardCount(): Promise<number> {
        return this.doctorCards.count();
    }
}
