import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

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

test('root redirects by preferred language', async ({ browser }) => {
  const ar = await browser.newContext({ locale: 'ar-BH' });
  const arPage = await ar.newPage();
  await arPage.goto('/');
  await expect(arPage).toHaveURL(/\/ar$/);
  const fr = await browser.newContext({ locale: 'fr-FR' });
  const frPage = await fr.newPage();
  await frPage.goto('/');
  await expect(frPage).toHaveURL(/\/en$/);
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
    await page.goto(path);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
}
