import { expect, type Page } from '@playwright/test';
import { test } from './helpers';

/**
 * Owner decision 2026-10-17: each page preloads only the face its headline needs, the display face of its own language
 * (Fraunces on /en, Amiri on /ar), so it is there for the first paint and nothing shifts when it arrives. The body and
 * mono faces load after the first paint. /en never downloads Amiri.
 */
const HEADLINE_FACE = { '/en': 'Fraunces', '/ar': 'Amiri' } as const;

/** Every @font-face of the page's stylesheets, as absolute source URLs with their family. */
const facesOf = (page: Page): Promise<{ family: string; url: string }[]> =>
  page.evaluate(() => {
    const faces: { family: string; url: string }[] = [];
    for (const sheet of [...document.styleSheets]) {
      let rules: CSSRuleList;
      try {
        rules = sheet.cssRules;
      } catch {
        continue;
      }
      for (const rule of [...rules]) {
        if (!(rule instanceof CSSFontFaceRule)) continue;
        const family = rule.style.getPropertyValue('font-family').replaceAll(/["']/g, '').trim();
        const src = rule.style.getPropertyValue('src');
        for (const [, url] of src.matchAll(/url\(["']?([^"')]+)["']?\)/g))
          faces.push({ family, url: new URL(url as string, sheet.href ?? location.href).href });
      }
    }
    return faces;
  });

for (const path of ['/en', '/ar'] as const) {
  test(`${path} preloads only its headline's display face, and the preload is the file the page uses`, async ({
    page,
  }) => {
    await page.goto(path);
    const preloads = await page
      .locator('head link[rel="preload"][as="font"]')
      .evaluateAll((links) => links.map((l) => (l as HTMLLinkElement).href));
    const faces = await facesOf(page);
    const families = preloads.map((href) => faces.find((f) => f.url === href)?.family ?? `unknown ${href}`);
    expect(families).toEqual([HEADLINE_FACE[path]]);
  });
}

test('/en has no Amiri preload and never downloads Amiri; /ar has the Amiri preload', async ({ page }) => {
  const fonts: string[] = [];
  page.on('request', (request) => {
    if (request.resourceType() === 'font') fonts.push(request.url());
  });
  await page.goto('/en');
  await page.waitForLoadState('networkidle');
  const faces = await facesOf(page);
  const amiri = faces.filter((f) => f.family === 'Amiri').map((f) => f.url);
  expect(amiri.length, 'the Amiri faces are declared, so the check can see them').toBeGreaterThan(0);
  expect(fonts.filter((url) => amiri.includes(url))).toEqual([]);
  const enPreloads = await page
    .locator('head link[rel="preload"][as="font"]')
    .evaluateAll((links) => links.map((l) => (l as HTMLLinkElement).href));
  expect(enPreloads.filter((href) => amiri.includes(href))).toEqual([]);

  await page.goto('/ar');
  const arPreloads = await page
    .locator('head link[rel="preload"][as="font"]')
    .evaluateAll((links) => links.map((l) => (l as HTMLLinkElement).href));
  const arAmiri = (await facesOf(page)).filter((f) => f.family === 'Amiri').map((f) => f.url);
  expect(arPreloads.filter((href) => arAmiri.includes(href))).toHaveLength(1);
});
