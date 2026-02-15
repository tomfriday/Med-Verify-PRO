import { test } from '@playwright/test';
import { AdminDashboard } from '../pages/AdminDashboard';

test.describe('Admin Dashboard E2E', () => {
    let adminPage: AdminDashboard;

    test.beforeEach(async ({ page }) => {
        adminPage = new AdminDashboard(page);
        await adminPage.page.goto('/');
    });

    test('shows admin role badge', async () => {
        await adminPage.expectRoleBadge('ADMIN');
    });

    test('displays system statistics', async () => {
        await adminPage.expectStatsVisible();
    });

    test('displays audit log entries', async () => {
        await adminPage.expectAuditLogsVisible();
    });

    test('navbar avatar is visible', async () => {
        await adminPage.expectNavbarAvatarVisible();
    });

    test('clicking avatar navigates to profile', async () => {
        await adminPage.navigateToProfile();
    });

    test('logout works', async () => {
        await adminPage.logout();
    });
});
