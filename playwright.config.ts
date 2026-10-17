import { defineConfig, devices } from '@playwright/test';
import { loadConfig } from './src/config';

// Validates BASE_URL and QUOTE_ID before any test runs.
const suiteConfig = loadConfig(process.env);
const isCI = Boolean(process.env.CI);

export default defineConfig({
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }], ...(isCI ? [['github'] as const] : [])],
  use: {
    baseURL: suiteConfig.baseUrl,
    headless: true,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'unit', testDir: './tests/unit' },
    { name: 'chromium', testDir: './tests/e2e', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', testDir: './tests/e2e', use: { ...devices['Desktop Firefox'] } },
    // WebKit is left out until the Quote loads there (issue #23); add it back here:
    // { name: 'webkit', testDir: './tests/e2e', use: { ...devices['Desktop Safari'] } },
  ],
});
