import { expect, test } from '@playwright/test';

test('loader counts up, clears, and does not return in the same session', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('html')).toHaveClass(/loading/);
  await expect(page.locator('[data-loader]')).toBeVisible();
  await expect(page.locator('html')).not.toHaveClass(/loading/, { timeout: 8000 });
  await expect(page.locator('[data-loader]')).toHaveCount(0);
  await page.reload();
  await expect(page.locator('html')).not.toHaveClass(/loading/);
});

/** The application's scripts (only the JavaScript: the stylesheets live in the same folder and must still load). */
const APP_SCRIPTS = '**/_next/static/chunks/*.js';
/** The head script's safety timeout (lib/theme-script.ts SAFETY_MS). */
const SAFETY_MS = 6000;

// Spec 6.5 and the spec 9 regression "loader always clears": the styles load, the app's scripts never do, and the
// loading screen is showing.
test('loader clears even if the application script never runs', async ({ browser }) => {
  const context = await browser.newContext();
  await context.route(APP_SCRIPTS, (route) => route.abort());
  const page = await context.newPage();
  const start = Date.now();
  await page.goto('/');
  // the stylesheet arrived, and the loading screen covers the page until the head script's timeout
  await expect(page.locator('[data-loader]')).toBeVisible();
  expect(Date.now() - start).toBeLessThan(SAFETY_MS);
  expect(await page.locator('[data-loader]').evaluate((el) => getComputedStyle(el).position)).toBe('fixed');
  await expect(page.locator('html')).not.toHaveClass(/loading/, { timeout: 8000 });
  await expect(page.locator('[data-loader]')).toBeHidden();
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  const headline = page.locator('#hero h1');
  await expect(headline).toBeInViewport();
  // the hero build, held while the loading screen showed, has run to its end: the headline is fully shown
  await expect
    .poll(() =>
      headline.evaluate((el) => {
        let opacity = 1;
        for (let node: Element | null = el; node; node = node.parentElement)
          opacity *= Number(getComputedStyle(node).opacity);
        return opacity;
      }),
    )
    .toBe(1);
  await context.close();
});

test('no loader with reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('html')).not.toHaveClass(/loading/);
});

test('a loader the safety timeout cleared does not return in the same session', async ({ browser }) => {
  const context = await browser.newContext();
  // the app arrives after the head script's 6 s timeout has already cleared the loader
  await context.route(APP_SCRIPTS, async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 6500));
    await route.continue();
  });
  const page = await context.newPage();
  const start = Date.now();
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('html')).toHaveClass(/loading/);
  // the head script ran at once (it is not held behind the stylesheet), so its timer, not the app, clears the loader
  expect(Date.now() - start).toBeLessThan(SAFETY_MS);
  await expect(page.locator('[data-loader]')).toBeVisible();
  await expect(page.locator('html')).not.toHaveClass(/loading/, { timeout: 8000 });
  expect(await page.evaluate(() => document.documentElement.classList.contains('enhanced'))).toBe(false);
  await page.reload({ waitUntil: 'domcontentloaded' });
  expect(await page.evaluate(() => document.documentElement.classList.contains('loading'))).toBe(false);
  await context.close();
});
