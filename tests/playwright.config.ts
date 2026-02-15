import { defineConfig } from '@playwright/test';
import path from 'path';

const AUTH_DIR = path.join(__dirname, '.auth');

export default defineConfig({
    testDir: '.',
    timeout: 30_000,
    retries: 1,
    workers: process.env.CI ? 1 : undefined,
    reporter: [
        ['html', { open: 'never' }],
        ['list'],
        ['json', { outputFile: 'test-results/results.json' }],
    ],
    use: {
        baseURL: 'http://localhost:5173',
        // Trace, video and screenshot on failure — "Trace Viewer pozwala debugować błędy na CI w sekundy"
        trace: 'retain-on-failure',
        video: 'retain-on-failure',
        screenshot: 'only-on-failure',
    },
    projects: [
        // ───────────────── SETUP ─────────────────
        {
            name: 'Auth Setup',
            testDir: '.',
            testMatch: /auth\.setup\.ts/,
        },

        // ─────────────── API TESTS ───────────────
        {
            name: 'API Tests',
            testDir: './api',
            use: {
                baseURL: 'http://localhost:3001',
            },
        },

        // ────────────── E2E — PATIENT ────────────
        {
            name: 'E2E Patient',
            testDir: './e2e',
            testMatch: /patient\.e2e\.spec\.ts/,
            dependencies: ['Auth Setup'],
            use: {
                browserName: 'chromium',
                headless: true,
                viewport: { width: 1280, height: 720 },
                storageState: path.join(AUTH_DIR, 'patient.json'),
            },
        },

        // ────────────── E2E — DOCTOR ─────────────
        {
            name: 'E2E Doctor',
            testDir: './e2e',
            testMatch: /doctor\.e2e\.spec\.ts/,
            dependencies: ['Auth Setup'],
            use: {
                browserName: 'chromium',
                headless: true,
                viewport: { width: 1280, height: 720 },
                storageState: path.join(AUTH_DIR, 'doctor.json'),
            },
        },

        // ─────────────── E2E — ADMIN ──────────────
        {
            name: 'E2E Admin',
            testDir: './e2e',
            testMatch: /admin\.e2e\.spec\.ts/,
            dependencies: ['Auth Setup'],
            use: {
                browserName: 'chromium',
                headless: true,
                viewport: { width: 1280, height: 720 },
                storageState: path.join(AUTH_DIR, 'admin.json'),
            },
        },

        // ────────────── E2E — PROFILE ─────────────
        {
            name: 'E2E Profile',
            testDir: './e2e',
            testMatch: /profile\.e2e\.spec\.ts/,
            dependencies: ['Auth Setup'],
            use: {
                browserName: 'chromium',
                headless: true,
                viewport: { width: 1280, height: 720 },
                storageState: path.join(AUTH_DIR, 'patient.json'),
            },
        },

        // ───── E2E — SEARCH (data-driven, patient auth) ─────
        {
            name: 'E2E Search',
            testDir: './e2e',
            testMatch: /search\.e2e\.spec\.ts/,
            dependencies: ['Auth Setup'],
            use: {
                browserName: 'chromium',
                headless: true,
                viewport: { width: 1280, height: 720 },
                storageState: path.join(AUTH_DIR, 'patient.json'),
            },
        },

        // ────── E2E — API MOCKING (patient auth) ──────
        {
            name: 'E2E API Mocking',
            testDir: './e2e',
            testMatch: /api-mocking\.e2e\.spec\.ts/,
            dependencies: ['Auth Setup'],
            use: {
                browserName: 'chromium',
                headless: true,
                viewport: { width: 1280, height: 720 },
                storageState: path.join(AUTH_DIR, 'patient.json'),
            },
        },

        // ────────── E2E — LOGIN (no auth) ─────────
        {
            name: 'E2E Login',
            testDir: './e2e',
            testMatch: /login\.e2e\.spec\.ts/,
            use: {
                browserName: 'chromium',
                headless: true,
                viewport: { width: 1280, height: 720 },
            },
        },
    ],
});
