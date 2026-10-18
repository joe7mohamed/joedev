import { expect } from '@playwright/test';
import { test } from '../e2e/helpers';
import { IMMUTABLE, REVALIDATE, securityHeaders } from '../src/lib/http-headers';

/*
 * Every header the static export sends through out/_headers, generated from the module `next start` sends them from
 * (src/lib/http-headers.ts), checked as wrangler serves them. Pages round, owner decision 2026-10-18.
 */
const SECURITY = securityHeaders('production');

test('every page, file, redirect and 404 carries the security headers, exactly once', async ({
  page,
  request,
}) => {
  await page.goto('/');
  const font = await page.locator('head link[rel="preload"][as="font"]').getAttribute('href');
  const script = await page.locator('script[src^="/_next/static/"]').first().getAttribute('src');
  for (const path of [
    '/',
    '/ar',
    '/fr',
    '/en',
    '/sitemap.xml',
    '/opengraph-image',
    '/shots/nuammer-1280.avif',
    font,
    script,
  ]) {
    const response = await request.get(path ?? '', { maxRedirects: 0 });
    const headers = response.headersArray();
    for (const { key, value } of SECURITY) {
      const sent = headers.filter((h) => h.name.toLowerCase() === key.toLowerCase()).map((h) => h.value);
      expect(sent, `${key} on ${path}`).toEqual([value]);
    }
  }
});

test('HSTS has no includeSubDomains or preload, and the CSP is the shipped one', async ({ request }) => {
  const h = (await request.get('/')).headers();
  expect(h['strict-transport-security']).toBe('max-age=31536000');
  expect(h['content-security-policy']).toBe(
    "default-src 'self'; script-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline'; font-src 'self'; connect-src 'self'; object-src 'none'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
  );
});

test('the HTML revalidates; the scripts, styles and fonts are cached for a year, immutable', async ({
  page,
  request,
}) => {
  await page.goto('/');
  for (const path of ['/', '/ar']) {
    const h = (await request.get(path)).headers();
    expect(h['cache-control'], path).toBe(REVALIDATE);
    expect(h.etag, path).toBeTruthy();
  }
  const fonts = await page
    .locator('head link[rel="preload"][as="font"]')
    .evaluateAll((links) => links.map((l) => (l as HTMLLinkElement).getAttribute('href') ?? ''));
  const files = await page.evaluate(() =>
    [
      ...document.querySelectorAll<HTMLScriptElement | HTMLLinkElement>(
        'script[src], link[rel="stylesheet"]',
      ),
    ].map((e) => e.getAttribute('src') ?? e.getAttribute('href') ?? ''),
  );
  const media = await page.evaluate(() =>
    performance
      .getEntriesByType('resource')
      .map((e) => new URL(e.name).pathname)
      .filter((p) => p.endsWith('.woff2')),
  );
  const hashed = [...new Set([...fonts, ...files, ...media])];
  expect(hashed.length).toBeGreaterThan(3);
  for (const path of hashed) {
    expect(path, 'a build file').toMatch(/^\/_next\/static\//);
    expect((await request.get(path)).headers()['cache-control'], path).toBe(IMMUTABLE);
  }
});

test('no header that next start does not send: no CORS wildcard', async ({ request }) => {
  for (const path of ['/', '/ar', '/shots/nuammer-1280.avif'])
    expect((await request.get(path)).headers()['access-control-allow-origin'], path).toBeUndefined();
});
