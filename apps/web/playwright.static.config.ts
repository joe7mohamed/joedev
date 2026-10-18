import { defineConfig, devices } from '@playwright/test';

/**
 * The static mode as Cloudflare Pages serves it (Pages round, owner decision 2026-10-18): the export in out/ behind
 * `wrangler pages dev`, which applies out/_headers and out/_redirects and routes `.html` files as Pages does. A
 * focused suite (e2e-static/); the full suite runs against `next start` (playwright.config.ts).
 * In CI the job has already run `npm run build:static` (a production build, as deployed); locally, build first.
 */
export const STATIC_PORT = 8788;
/** wrangler wants a compatibility date even for static files; it changes nothing they serve. */
const COMPATIBILITY_DATE = '2026-10-01';
const serve = [
  'npx wrangler pages dev out',
  `--port ${STATIC_PORT} --ip 127.0.0.1`,
  `--compatibility-date ${COMPATIBILITY_DATE}`,
  '--show-interactive-dev-session=false --log-level warn',
].join(' ');

export default defineConfig({
  testDir: './e2e-static',
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['dot'], ['html', { open: 'never' }]] : 'list',
  use: { baseURL: `http://127.0.0.1:${STATIC_PORT}`, trace: 'on-first-retry' },
  webServer: {
    command: process.env.CI ? serve : `npm run build:static && ${serve}`,
    url: `http://127.0.0.1:${STATIC_PORT}/`,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    // no usage reports from the test server
    env: { WRANGLER_SEND_METRICS: 'false' },
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    { name: 'phone', use: { ...devices['Pixel 7'] } },
  ],
});
