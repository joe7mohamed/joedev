import AxeBuilder from '@axe-core/playwright';
import { expect, type Page } from '@playwright/test';
import { gotoScene, progressOf, settle, test } from '../e2e/helpers';

/*
 * The page itself in the static export, as Pages serves it: the soft language switch (the RSC payloads are files
 * now), the screenshots without an image server, axe, the CSP, and the per-locale font preload. Pages round, owner
 * decision 2026-10-18; the full checks of each run against `next start` in e2e/.
 */
const SCENES = ['hero', 'work', 'process', 'about', 'contact'];
const ADDRESS = { en: /^https?:\/\/[^/]+\/$/, ar: /^https?:\/\/[^/]+\/ar$/ } as const;
const HEADLINE = { en: 'I build software that holds up under pressure.', ar: 'أبني برمجيات تصمد تحت الضغط.' };

const switchLanguage = async (page: Page, to: keyof typeof ADDRESS): Promise<void> => {
  await page.locator(`header a[hreflang="${to}"]`).click();
  await page.waitForURL(ADDRESS[to]);
};

test('the switch changes the page in place both ways, without reloading the document', async ({ page }) => {
  await page.goto('/');
  const theme = await page.locator('html').getAttribute('data-theme');
  await page.evaluate(() => {
    (window as unknown as { zkSameDocument: boolean }).zkSameDocument = true;
  });
  for (const [to, dir] of [
    ['ar', 'rtl'],
    ['en', 'ltr'],
  ] as const) {
    await switchLanguage(page, to);
    await expect(page.locator('html')).toHaveAttribute('lang', to);
    await expect(page.locator('html')).toHaveAttribute('dir', dir);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(HEADLINE[to]);
    expect(
      await page.evaluate(() => (window as unknown as { zkSameDocument?: boolean }).zkSameDocument === true),
      `still the same document after switching to ${to}`,
    ).toBe(true);
    await expect(page.locator('html')).toHaveAttribute('data-theme', theme ?? '');
    await expect(page.locator('html')).toHaveClass(/\benhanced\b/);
  }
});

test('the switch keeps the scene and the progress through it on the pinned page', async ({ page }) => {
  await page.goto('/');
  await gotoScene(page, 'process', 0.5);
  await switchLanguage(page, 'ar');
  await expect.poll(() => progressOf(page, 'process'), { timeout: 5000 }).toBeCloseTo(0.5, 1);
  await gotoScene(page, 'about', 0.5);
  await switchLanguage(page, 'en');
  await expect.poll(() => progressOf(page, 'about'), { timeout: 5000 }).toBeCloseTo(0.5, 1);
});

test('the browser back and forward buttons move between the languages in place too', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => {
    (window as unknown as { zkSameDocument: boolean }).zkSameDocument = true;
  });
  await switchLanguage(page, 'ar');
  await page.goBack();
  await page.waitForURL(ADDRESS.en);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(HEADLINE.en);
  await page.goForward();
  await page.waitForURL(ADDRESS.ar);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(HEADLINE.ar);
  expect(
    await page.evaluate(() => (window as unknown as { zkSameDocument?: boolean }).zkSameDocument === true),
  ).toBe(true);
});

for (const path of ['/', '/ar']) {
  test(`the screenshots of ${path} load from the built files, AVIF here, never from an image server`, async ({
    page,
  }) => {
    const images: string[] = [];
    page.on('request', (r) => {
      if (r.resourceType() === 'image') images.push(new URL(r.url()).pathname);
    });
    await page.goto(path);
    for (const f of [0.17, 0.5, 0.83]) await gotoScene(page, 'work', f);
    const shots = page.locator('#gold-content img');
    await expect(shots).toHaveCount(3);
    for (const img of await shots.all()) {
      await expect.poll(() => img.evaluate((i: HTMLImageElement) => i.complete && i.naturalWidth)).toBe(1280);
      expect(await img.evaluate((i: HTMLImageElement) => new URL(i.currentSrc).pathname)).toMatch(
        /^\/shots\/[a-z]+-1280\.avif$/,
      );
    }
    await page.waitForLoadState('networkidle');
    expect(images.filter((p) => p.startsWith('/_next/image'))).toEqual([]);
    const shotFiles = images.filter((p) => p.startsWith('/shots/'));
    // each screenshot once: the hero zoom, the preload and the frame share the one file
    expect(shotFiles.toSorted()).toEqual([...new Set(shotFiles)].toSorted());
    expect(shotFiles.every((p) => p.endsWith('.avif'))).toBe(true);
  });
}

test('the stacked page shows each screenshot in its article', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const shots = page.locator('#work [data-shot] img');
  await expect(shots).toHaveCount(3);
  for (const img of await shots.all()) {
    await img.scrollIntoViewIfNeeded();
    await expect.poll(() => img.evaluate((i: HTMLImageElement) => i.complete && i.naturalWidth)).toBe(1280);
  }
});

for (const path of ['/', '/ar']) {
  test(`no accessibility violations on ${path}`, async ({ page }) => {
    await page.goto(path);
    for (const id of SCENES) {
      await gotoScene(page, id, 0.5);
      await settle(page);
      const results = await new AxeBuilder({ page }).analyze();
      expect(results.violations, id).toEqual([]);
    }
  });

  test(`${path} runs under the shipped Content-Security-Policy without one violation`, async ({ page }) => {
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
    await page.goto(path);
    await expect(page.locator('html')).toHaveClass(/\benhanced\b/);
    for (const id of SCENES) await gotoScene(page, id, 0.5);
    await page.waitForLoadState('networkidle');
    expect(reports).toEqual([]);
  });
}

/** The display face each page preloads (owner decision 2026-10-17): its own headline's, and no other. */
const HEADLINE_FACE = {
  '/': /\/fraunces-latin\.[^/]+\.woff2$/,
  '/ar': /\/amiri-bold\.[^/]+\.woff2$/,
} as const;

for (const [path, face] of Object.entries(HEADLINE_FACE)) {
  test(`${path} preloads only its headline's display face, downloaded once`, async ({ page }) => {
    const fonts = new Map<string, number>();
    page.on('request', (r) => {
      if (r.resourceType() === 'font') fonts.set(r.url(), (fonts.get(r.url()) ?? 0) + 1);
    });
    await page.goto(path);
    await page.waitForLoadState('networkidle');
    const preloads = await page
      .locator('head link[rel="preload"][as="font"]')
      .evaluateAll((links) => links.map((l) => (l as HTMLLinkElement).href));
    expect(preloads).toHaveLength(1);
    expect(preloads[0]).toMatch(face);
    expect(fonts.get(preloads[0] as string)).toBe(1);
    expect([...fonts.values()].every((n) => n === 1)).toBe(true);
    if (path === '/') expect([...fonts.keys()].filter((u) => /amiri/i.test(u))).toEqual([]);
  });
}
