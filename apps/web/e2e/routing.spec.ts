import { expect, type Page } from '@playwright/test';
import { test } from './helpers';

/*
 * Owner decision 2026-10-17: English lives at the plain domain `/`, Arabic at `/ar`. `/en` is a permanent redirect to
 * `/`. Every address a search engine or a sharing card reads follows the same two URLs.
 */
const SITE = 'https://zakydev.com';
// the root without its slash, as Next writes the canonical; the sitemap and the structured data write it the same way
const HOME = { en: { path: '/', url: SITE }, ar: { path: '/ar', url: `${SITE}/ar` } } as const;

/** An address read from the page, byte for byte. */
const attribute = async (page: Page, selector: string, name: string): Promise<string> =>
  (await page.locator(selector).getAttribute(name)) ?? '';

for (const [locale, { path, url }] of Object.entries(HOME)) {
  test(`${path} is served directly, with status 200 and the ${locale} page`, async ({ request, page }) => {
    const response = await request.get(path, { maxRedirects: 0 });
    expect(response.status()).toBe(200);
    // still the page prerendered at build time, not one rendered on request
    expect(response.headers()['x-nextjs-prerender']).toBeTruthy();
    await page.goto(path);
    await expect(page).toHaveURL(new RegExp(`^https?://[^/]+${path}$`));
    await expect(page.locator('html')).toHaveAttribute('lang', locale);
  });

  test(`${path} names ${url} as its canonical URL, in the sharing card and in the structured data`, async ({
    page,
  }) => {
    await page.goto(path);
    expect(await attribute(page, 'link[rel="canonical"]', 'href')).toBe(url);
    expect(await attribute(page, 'meta[property="og:url"]', 'content')).toBe(url);
    const ld = JSON.parse((await page.locator('script[type="application/ld+json"]').textContent()) ?? '{}');
    expect(ld.url).toBe(url);
  });

  test(`${path} lists English at / and Arabic at /ar, with / as the default`, async ({ page }) => {
    await page.goto(path);
    const alternate = (lang: string) => attribute(page, `link[rel="alternate"][hreflang="${lang}"]`, 'href');
    expect(await alternate('en')).toBe(HOME.en.url);
    expect(await alternate('ar')).toBe(HOME.ar.url);
    expect(await alternate('x-default')).toBe(HOME.en.url);
  });

  test(`the sharing image of ${path} is served at its own address, without a redirect`, async ({
    page,
    request,
  }) => {
    await page.goto(path);
    const image = new URL(await attribute(page, 'meta[property="og:image"]', 'content'));
    const response = await request.get(image.pathname, { maxRedirects: 0 });
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toBe('image/png');
  });
}

test('the sitemap lists / and /ar, each with both alternates and / as the default', async ({ request }) => {
  const xml = await (await request.get('/sitemap.xml')).text();
  expect([...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])).toEqual([HOME.en.url, HOME.ar.url]);
  for (const [lang, href] of [
    ['en', HOME.en.url],
    ['ar', HOME.ar.url],
    ['x-default', HOME.en.url],
  ])
    expect(xml).toContain(`hreflang="${lang}" href="${href}"`);
  expect(xml).not.toContain(`${SITE}/en`);
});

test('/en/ ends at the root too', async ({ page }) => {
  await page.goto('/en/');
  await expect(page).toHaveURL(/^https?:\/\/[^/]+\/$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
});

test('robots, the manifest and the icons are served without a redirect', async ({ request }) => {
  for (const path of ['/robots.txt', '/manifest.webmanifest', '/sitemap.xml', '/icon.svg', '/apple-icon'])
    expect((await request.get(path, { maxRedirects: 0 })).status(), path).toBe(200);
});

test("the 404 page's home link points to the root", async ({ page }) => {
  const response = await page.goto('/fr');
  expect(response?.status()).toBe(404);
  await expect(page.getByRole('link', { name: 'ZakyDev' })).toHaveAttribute('href', '/');
});
