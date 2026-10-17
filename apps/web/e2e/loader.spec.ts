import { expect, test } from '@playwright/test';

test('loader counts up, clears, and does not return in the same session', async ({ page }) => {
  await page.goto('/en');
  await expect(page.locator('html')).toHaveClass(/loading/);
  await expect(page.locator('[data-loader]')).toBeVisible();
  await expect(page.locator('html')).not.toHaveClass(/loading/, { timeout: 8000 });
  await expect(page.locator('[data-loader]')).toHaveCount(0);
  await page.reload();
  await expect(page.locator('html')).not.toHaveClass(/loading/);
});

test('loader clears even if the application script never runs', async ({ browser }) => {
  const context = await browser.newContext();
  await context.route('**/_next/static/chunks/**', (route) => route.abort());
  const page = await context.newPage();
  await page.goto('/en');
  await expect(page.locator('html')).not.toHaveClass(/loading/, { timeout: 8000 });
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});

test('no loader with reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/en');
  await expect(page.locator('html')).not.toHaveClass(/loading/);
});
