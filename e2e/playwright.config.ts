import { defineConfig, devices } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Shared path for the authenticated browser state file.
// The setup project writes it; the chromium project reads it.
const authFile = path.join(__dirname, 'playwright', '.auth', 'user.json');

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    // --- Setup project: logs in once and saves storageState ---
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
    },

    // --- Main browser project: depends on setup, starts authenticated ---
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // Every test in this project loads the saved auth state automatically
        storageState: authFile,
      },
      dependencies: ['setup'],
      // Ignore the setup file so it doesn't run twice
      testIgnore: /auth\.setup\.ts/,
    },
  ],
});
