import 'dotenv/config';
import { defineConfig, devices } from '@playwright/test';
import { AUTH_FILE } from './tests/auth.constants';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: process.env.DIDAXIS_URL,
    headless: !!process.env.CI,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },
    {
      name: 'chromium',
      testIgnore: [/ds\d-.*\.spec\.ts$/, /.*\.setup\.ts$/],
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'chromium-didaxis',
      testMatch: /ds\d-.*\.spec\.ts$/,
      dependencies: ['setup'],
      fullyParallel: false,
      workers: 1,
      use: {
        ...devices['Desktop Chrome'],
        storageState: AUTH_FILE,
      },
    },
  ],
});
