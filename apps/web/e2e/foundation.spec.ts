import AxeBuilder from '@axe-core/playwright';
import { expect } from '@playwright/test';
import { settle, test } from './helpers';

test('English page is left-to-right with the agreed headline', async ({ page }) => {
  await page.goto('/en');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'I build software that holds up under pressure.',
  );
});

test('Arabic page is right-to-left with the agreed headline', async ({ page }) => {
  await page.goto('/ar');
  await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('أبني برمجيات تصمد تحت الضغط.');
});

// owner decision 2026-10-17: English lives at the plain domain for every visitor, Arabic at /ar
test('root serves the English page to every visitor, whatever their language', async ({ browser }) => {
  for (const locale of ['ar-BH', 'fr-FR']) {
    const context = await browser.newContext({ locale });
    const page = await context.newPage();
    const response = await page.goto('/');
    expect(response?.status(), locale).toBe(200);
    expect(response?.request().redirectedFrom(), locale).toBeNull();
    await expect(page).toHaveURL(/^https?:\/\/[^/]+\/$/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await context.close();
  }
});

test('unknown locale is a 404 with our own page, not the built-in one', async ({ page }) => {
  const response = await page.goto('/fr');
  expect(response?.status()).toBe(404);
  // only our global-not-found runs the theme script; the built-in page has no data-theme
  await expect(page.locator('html')).toHaveAttribute('data-theme', /^(dark|light)$/);
});

test('theme follows the system on first paint and the toggle after', async ({ browser }) => {
  const light = await browser.newContext({ colorScheme: 'light' });
  const page = await light.newPage();
  await page.goto('/en');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.getByRole('button', { name: 'Switch theme' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await light.close();
});

test('a light-system visitor whose storage throws still gets the light theme', async ({ browser }) => {
  const light = await browser.newContext({ colorScheme: 'light' });
  const page = await light.newPage();
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => {
      throw new Error('storage blocked');
    };
  });
  await page.goto('/en');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await light.close();
});

test('canonical and hreflang links are absolute', async ({ page }) => {
  await page.goto('/en');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /^https?:\/\/[^/]+\/?$/);
  await expect(page.locator('link[rel="alternate"][hreflang="ar"]')).toHaveAttribute('href', /^https?:\/\//);
});

test('/en redirects permanently to the root and keeps the query string; the root does not vary by language', async ({
  request,
}) => {
  const en = await request.get('/en?utm=1', { maxRedirects: 0 });
  expect(en.status()).toBe(308);
  expect(en.headers().location).toMatch(/^(https?:\/\/[^/]+)?\/\?utm=1$/);
  const root = await request.get('/', { headers: { 'accept-language': 'ar-BH' }, maxRedirects: 0 });
  expect(root.status()).toBe(200);
  expect(root.headers().vary ?? '').not.toContain('Accept-Language');
  expect(root.headers()['cache-control'] ?? '').not.toContain('no-store');
});

test('security headers are set, and HSTS has no includeSubDomains or preload', async ({ request }) => {
  const h = (await request.get('/en')).headers();
  expect(h['x-content-type-options']).toBe('nosniff');
  expect(h['referrer-policy']).toBe('strict-origin-when-cross-origin');
  expect(h['x-frame-options']).toBe('DENY');
  expect(h['permissions-policy']).toContain('camera=()');
  expect(h['strict-transport-security']).toBe('max-age=31536000');
});

test('www redirects permanently to the bare domain', async ({ request }) => {
  const response = await request.get('/en', { headers: { host: 'www.zakydev.com' }, maxRedirects: 0 });
  expect(response.status()).toBe(308);
  expect(response.headers().location).toBe('https://zakydev.com/en');
});

test('makes no third-party requests', async ({ page }) => {
  const foreign: string[] = [];
  page.on('request', (r) => {
    if (!r.url().startsWith('http://localhost:3000')) foreign.push(r.url());
  });
  await page.goto('/ar');
  await page.waitForLoadState('networkidle');
  expect(foreign).toEqual([]);
});

for (const path of ['/en', '/ar']) {
  test(`no accessibility violations on ${path}`, async ({ page }) => {
    // checked at rest: mid-intro text is still fading in, which axe reads as low contrast
    await page.goto(path);
    await settle(page);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
}
