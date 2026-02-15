import { type Page, type Locator } from '@playwright/test';
import { BaseDashboard } from './BaseDashboard';

/**
 * Page Object Model for the Admin Dashboard.
 * Handles statistics, audit logs, and tab navigation.
 * All selectors use data-testid for stability.
 */
export class AdminDashboard extends BaseDashboard {
    readonly tabStats: Locator;
    readonly tabLogs: Locator;
    readonly statTotalUsers: Locator;
    readonly statDoctors: Locator;
    readonly statPatients: Locator;
    readonly statTotalAppointments: Locator;
    readonly auditLogRows: Locator;
    readonly auditLogsTable: Locator;

    constructor(page: Page) {
        super(page);
        this.tabStats = page.getByTestId('tab-stats');
        this.tabLogs = page.getByTestId('tab-logs');
        this.statTotalUsers = page.getByTestId('stat-total-users');
        this.statDoctors = page.getByTestId('stat-doctors');
        this.statPatients = page.getByTestId('stat-patients');
        this.statTotalAppointments = page.getByTestId('stat-total-appointments');
        this.auditLogRows = page.locator('[data-testid^="audit-log-row"]');
        this.auditLogsTable = page.getByTestId('audit-logs-table');
    }

    async switchToLogsTab() {
        await this.tabLogs.click();
        await this.page.waitForTimeout(1000);
    }
}
