import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['dot'], ['html', { open: 'never' }]] : 'list',
  use: { baseURL: 'http://localhost:3000', trace: 'on-first-retry' },
  // In CI, Turborepo has already built the app (`e2e` depends on `build`, with NEXT_PUBLIC_E2E=1 set by the job);
  // locally, build first. NEXT_PUBLIC_E2E=1 compiles in the test-only switches (src/lib/e2e.ts), such as `?bg=soft`.
  webServer: {
    command: process.env.CI ? 'npm start' : 'NEXT_PUBLIC_E2E=1 npm run build && npm start',
    url: 'http://localhost:3000/en',
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    { name: 'phone', use: { ...devices['Pixel 7'] } },
  ],
});
