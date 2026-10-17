import AxeBuilder from '@axe-core/playwright';
import { expect, type Page } from '@playwright/test';
import { gotoScene, settle, test } from './helpers';

const SCENES = ['hero', 'work', 'process', 'about', 'contact'];

for (const path of ['/', '/ar']) {
  for (const theme of ['dark', 'light']) {
    test(`axe: ${path} ${theme}`, async ({ page }) => {
      await page.addInitScript((t) => {
        localStorage.setItem('zk-theme', t);
      }, theme);
      await page.goto(path);
      for (const id of SCENES) {
        await gotoScene(page, id, 0.5);
        // checked at rest, as every axe check in this repo is: mid-animation text reads as low contrast
        await settle(page);
        const results = await new AxeBuilder({ page }).analyze();
        expect(results.violations, `${id}`).toEqual([]);
      }
    });
  }
}

test('metadata, alternates and structured data are present', async ({ page }) => {
  await page.goto('/ar');
  await expect(page).toHaveTitle('يوسف زكي — مهندس برمجيات | ZakyDev');
  await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveCount(1);
  await expect(page.locator('link[rel="alternate"][hreflang="x-default"]')).toHaveCount(1);
  await expect(page.locator('meta[property="og:image"]')).toHaveCount(1);
  const ld = JSON.parse((await page.locator('script[type="application/ld+json"]').textContent()) ?? '{}');
  expect(ld['@type']).toBe('Person');
  expect(ld.email).toBe('mailto:youssef@zakydev.com');
});

test('sitemap and robots are served', async ({ request }) => {
  expect((await request.get('/sitemap.xml')).status()).toBe(200);
  expect(await (await request.get('/robots.txt')).text()).toContain('Sitemap:');
});

test('the sitemap lists both locales with their alternates', async ({ request }) => {
  const xml = await (await request.get('/sitemap.xml')).text();
  // owner decision 2026-10-17: English at the plain domain, Arabic at /ar
  for (const url of ['https://zakydev.com', 'https://zakydev.com/ar'])
    expect(xml).toContain(`<loc>${url}</loc>`);
  expect(xml).toContain('hreflang="ar"');
  expect(xml).toContain('hreflang="x-default"');
});

/** Width and height from a PNG's IHDR chunk. */
const pngSize = (png: Buffer): { width: number; height: number } => ({
  width: png.readUInt32BE(16),
  height: png.readUInt32BE(20),
});

test('the manifest and the icon are linked and served', async ({ page, request }) => {
  await page.goto('/');
  await expect(page.locator('link[rel="manifest"]')).toHaveCount(1);
  await expect(page.locator('link[rel="icon"][type="image/svg+xml"]')).toHaveCount(1);
  const manifest = await (await request.get('/manifest.webmanifest')).json();
  expect(manifest).toMatchObject({ name: 'ZakyDev', theme_color: '#0F0E0C', background_color: '#0F0E0C' });
  for (const icon of manifest.icons as { src: string }[]) {
    expect((await request.get(icon.src)).status(), icon.src).toBe(200);
  }
});

// Spec 6.7 "app icons": home screens (Android, iOS) need raster icons, and a maskable one keeps its mark in the safe
// zone; iOS reads the apple-touch-icon.
test('the manifest lists PNG app icons and the page links an apple-touch-icon', async ({ page, request }) => {
  const manifest = await (await request.get('/manifest.webmanifest')).json();
  const icons = manifest.icons as { src: string; sizes: string; type: string; purpose?: string }[];
  for (const [sizes, purpose] of [
    ['192x192', undefined],
    ['512x512', undefined],
    ['512x512', 'maskable'],
  ] as const) {
    const icon = icons.find((i) => i.type === 'image/png' && i.sizes === sizes && i.purpose === purpose);
    expect(icon, `${sizes} ${purpose ?? 'any'}`).toBeDefined();
    const response = await request.get(icon?.src ?? '');
    expect(response.headers()['content-type']).toBe('image/png');
    const [width, height] = sizes.split('x').map(Number);
    expect(pngSize(await response.body())).toEqual({ width, height });
  }
  await page.goto('/');
  const touch = page.locator('link[rel="apple-touch-icon"]');
  await expect(touch).toHaveCount(1);
  const response = await request.get((await touch.getAttribute('href')) ?? '');
  expect(response.headers()['content-type']).toBe('image/png');
  expect(pngSize(await response.body())).toEqual({ width: 180, height: 180 });
});

for (const path of ['/', '/ar']) {
  test(`sharing image of ${path} is a 1200 x 630 PNG with an alt text and a large card`, async ({
    page,
    request,
  }) => {
    await page.goto(path);
    const url = await page.locator('meta[property="og:image"]').getAttribute('content');
    expect(url).toBeTruthy();
    await expect(page.locator('meta[property="og:image:alt"]')).toHaveCount(1);
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary_large_image');
    // the absolute URL points at the production host; fetch the same path from this server
    const res = await request.get(new URL(url as string).pathname);
    expect(res.status()).toBe(200);
    expect(res.headers()['content-type']).toBe('image/png');
    expect(pngSize(await res.body())).toEqual({ width: 1200, height: 630 });
  });
}

test('there is no sharing image for an unknown locale', async ({ request }) => {
  expect((await request.get('/fr/opengraph-image')).status()).toBe(404);
});

const CSP =
  "default-src 'self'; script-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline'; font-src 'self'; connect-src 'self'; object-src 'none'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'";

/** Every CSP report the page raises, from the console and from `securitypolicyviolation` events. */
const watchCsp = async (page: Page): Promise<string[]> => {
  const reports: string[] = [];
  page.on('console', (m) => {
    if (m.text().includes('Content Security Policy')) reports.push(m.text());
  });
  await page.exposeFunction('reportCsp', (line: string) => reports.push(line));
  await page.addInitScript(() => {
    document.addEventListener('securitypolicyviolation', (e) => {
      (window as unknown as { reportCsp: (l: string) => void }).reportCsp(
        `${e.violatedDirective} ${e.blockedURI}`,
      );
    });
  });
  return reports;
};

// `?bg=soft` lets the E2E build run the WebGL background in headless Chromium, so the shader is checked too
for (const path of ['/', '/ar', '/?bg=soft']) {
  test(`the page runs under the shipped Content-Security-Policy: ${path}`, async ({ page }) => {
    const reports = await watchCsp(page);
    const res = await page.goto(path);
    expect(res?.headers()['content-security-policy']).toBe(CSP);
    await expect(page.locator('html')).toHaveClass(/\benhanced\b/);
    for (const id of SCENES) await gotoScene(page, id, 0.5);
    await page.waitForLoadState('networkidle');
    expect(reports).toEqual([]);
  });
}
