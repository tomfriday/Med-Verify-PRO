import { defineConfig } from '@playwright/test';

export default defineConfig({
    testDir: '.',
    timeout: 30_000,
    retries: 0,
    reporter: [['html', { open: 'never' }], ['list']],
    use: {
        baseURL: 'http://localhost:5173',
        extraHTTPHeaders: {},
        trace: 'on-first-retry',
    },
    projects: [
        {
            name: 'API Tests',
            testDir: './api',
            use: {
                baseURL: 'http://localhost:3001',
            },
        },
        {
            name: 'E2E Tests',
            testDir: './e2e',
            use: {
                browserName: 'chromium',
                headless: true,
                viewport: { width: 1280, height: 720 },
                baseURL: 'http://localhost:5173',
            },
        },
    ],
});
