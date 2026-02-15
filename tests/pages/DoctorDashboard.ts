import { type Page, type Locator } from '@playwright/test';
import { BaseDashboard } from './BaseDashboard';

/**
 * Page Object Model for the Doctor Dashboard.
 * Handles slot management, appointments, and notes tabs.
 * All selectors use data-testid for stability.
 */
export class DoctorDashboard extends BaseDashboard {
    readonly tabAppointments: Locator;
    readonly tabSlots: Locator;
    readonly tabNotes: Locator;
    readonly appointmentsTable: Locator;
    readonly slotsGrid: Locator;
    readonly slotDateInput: Locator;
    readonly slotStartInput: Locator;
    readonly slotEndInput: Locator;
    readonly createSlotsBtn: Locator;
    readonly navbar: Locator;

    constructor(page: Page) {
        super(page);
        this.tabAppointments = page.getByTestId('tab-appointments');
        this.tabSlots = page.getByTestId('tab-slots');
        this.tabNotes = page.getByTestId('tab-notes');
        this.appointmentsTable = page.getByTestId('doctor-appointments-table');
        this.slotsGrid = page.getByTestId('existing-slots');
        this.slotDateInput = page.getByTestId('slot-date');
        this.slotStartInput = page.getByTestId('slot-start');
        this.slotEndInput = page.getByTestId('slot-end');
        this.createSlotsBtn = page.getByTestId('create-slots-btn');
        this.navbar = page.getByTestId('doctor-navbar');
    }

    async switchToSlotsTab() {
        await this.tabSlots.click();
        await this.page.waitForTimeout(500);
    }

    async switchToNotesTab() {
        await this.tabNotes.click();
        await this.page.waitForTimeout(500);
    }
}
