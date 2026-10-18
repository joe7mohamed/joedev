import { expect } from '@playwright/test';
import { test } from '../e2e/helpers';

/*
 * The routes of the static export as Pages serves them (wrangler pages dev, playwright.static.config.ts): the same
 * answers `next start` gives (e2e/routing.spec.ts, e2e/foundation.spec.ts), from files, out/_redirects and Pages'
 * own `.html` routing. Owner decisions 2026-10-17 (English at /, Arabic at /ar) and 2026-10-18 (Pages first).
 */

for (const [path, lang, dir] of [
  ['/', 'en', 'ltr'],
  ['/ar', 'ar', 'rtl'],
] as const) {
  test(`${path} is the ${lang} page, served directly with status 200`, async ({ page, request }) => {
    const response = await request.get(path, { maxRedirects: 0 });
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('text/html');
    await page.goto(path);
    await expect(page).toHaveURL(new RegExp(`^https?://[^/]+${path}$`));
    await expect(page.locator('html')).toHaveAttribute('lang', lang);
    await expect(page.locator('html')).toHaveAttribute('dir', dir);
  });
}

test('/en is a permanent redirect to / that keeps the query string, with and without its slash', async ({
  request,
}) => {
  for (const [path, location] of [
    ['/en', '/'],
    ['/en?utm=1', '/?utm=1'],
    ['/en/', '/'],
  ] as const) {
    const response = await request.get(path, { maxRedirects: 0 });
    expect(response.status(), path).toBe(308);
    expect(response.headers().location, path).toMatch(
      new RegExp(`^(https?://[^/]+)?${location.replace('?', '\\?')}$`),
    );
  }
});

test('/ar/ and the .html file names end at the clean addresses', async ({ page }) => {
  for (const [path, end] of [
    ['/ar/', /\/ar$/],
    ['/ar.html', /\/ar$/],
    ['/index.html', /^https?:\/\/[^/]+\/$/],
  ] as const) {
    await page.goto(path);
    await expect(page, path).toHaveURL(end);
  }
});

test('unknown addresses are a 404 with our own page, not the home page', async ({ page }) => {
  for (const path of ['/fr', '/en/x', '/ar/x', '/fr/opengraph-image']) {
    const response = await page.goto(path);
    expect(response?.status(), path).toBe(404);
    // only our global-not-found runs the theme script, and it has no headline
    await expect(page.locator('html'), path).toHaveAttribute('data-theme', /^(dark|light)$/);
    await expect(page.getByRole('heading', { level: 1 }), path).toHaveText('404');
    await expect(page.getByRole('link', { name: 'ZakyDev' }), path).toHaveAttribute('href', '/');
  }
});

test('the sharing images, sitemap, robots, manifest and icons are served, the images as PNGs', async ({
  page,
  request,
}) => {
  for (const path of ['/', '/ar']) {
    await page.goto(path);
    const image = new URL((await page.locator('meta[property="og:image"]').getAttribute('content')) ?? '');
    const response = await request.get(image.pathname, { maxRedirects: 0 });
    expect(response.status(), image.pathname).toBe(200);
    expect(response.headers()['content-type'], image.pathname).toBe('image/png');
  }
  for (const [path, type] of [
    ['/sitemap.xml', 'xml'],
    ['/robots.txt', 'text/plain'],
    ['/manifest.webmanifest', 'manifest+json'],
    ['/icon.svg', 'image/svg+xml'],
    ['/apple-icon', 'image/png'],
    ['/app-icons/icon-192.png', 'image/png'],
    ['/app-icons/icon-512.png', 'image/png'],
    ['/app-icons/maskable-512.png', 'image/png'],
  ] as const) {
    const response = await request.get(path, { maxRedirects: 0 });
    expect(response.status(), path).toBe(200);
    expect(response.headers()['content-type'], path).toContain(type);
  }
});

test('the sitemap and the canonical URLs are the slash-less root and /ar', async ({ page, request }) => {
  const xml = await (await request.get('/sitemap.xml')).text();
  expect([...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])).toEqual([
    'https://zakydev.com',
    'https://zakydev.com/ar',
  ]);
  for (const [path, url] of [
    ['/', 'https://zakydev.com'],
    ['/ar', 'https://zakydev.com/ar'],
  ] as const) {
    await page.goto(path);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', url);
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', url);
  }
});
