import { type Browser, expect, type Page } from '@playwright/test';
import { expectNoBlankScreen, gotoScene, test, untilBuilt } from './helpers';

/**
 * Real phones and laptops are shorter than the reference sizes: iPhone Safari with its toolbars gives 640–745 px of
 * small viewport, and a 1366 x 768 laptop gives Chrome about 657 px. The designed, pinned page must hold there too
 * (spec 1: a first-time visitor on a mid-range phone; spec 6.4: never a blank screen).
 */
const SHORT = [
  { width: 360, height: 640, mobile: true },
  { width: 390, height: 664, mobile: true },
  { width: 1280, height: 632, mobile: false },
  { width: 1366, height: 657, mobile: false },
  { width: 1536, height: 730, mobile: false },
];
/**
 * Owner decision 2026-10-17: large phones (about 414–430 x 832, a little shorter than the 412 x 839 reference for their
 * width), a window of about 860 x 700 (the widest phone layout, short), and the 768 x 1024 tablet pin every scene too.
 */
const LARGE = [
  { width: 414, height: 832, mobile: true },
  { width: 428, height: 836, mobile: true },
  { width: 430, height: 832, mobile: true },
  { width: 860, height: 700, mobile: false },
  { width: 768, height: 1024, mobile: true },
];
type Viewport = (typeof SHORT)[number];
const ALL: Viewport[] = [...SHORT, ...LARGE];
/** Where every scene must pin: the commonest iPhone and laptop sizes, and the large ones. */
const MUST_PIN = [
  ...SHORT.filter((v) => (v.width === 390 && v.height === 664) || v.width === 1366),
  ...LARGE,
];
const sizeOf = (v: Viewport): string => `${v.width}x${v.height}`;

const open = async (browser: Browser, viewport: Viewport, path: string): Promise<Page> => {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    isMobile: viewport.mobile,
    hasTouch: viewport.mobile,
  });
  const page = await context.newPage();
  await page.addInitScript(() => sessionStorage.setItem('zk-intro', '1'));
  await page.goto(path);
  await page.waitForFunction(() => document.documentElement.classList.contains('enhanced'));
  // the display faces change line heights when they arrive; the engine refits on font load
  await page.evaluate(() => document.fonts.ready.then(() => undefined));
  await untilBuilt(page);
  return page;
};

test.beforeEach(({ browser: _ }, testInfo) => {
  // the viewports are set here, so one project is enough
  test.skip(testInfo.project.name !== 'desktop', 'viewports are explicit');
});

for (const path of ['/', '/ar']) {
  for (const viewport of MUST_PIN) {
    test(`every scene is pinned at ${sizeOf(viewport)} on ${path}`, async ({ browser }) => {
      const page = await open(browser, viewport, path);
      const flowing = await page
        .locator('[data-scene][data-unpinned]')
        .evaluateAll((els) => els.map((e) => e.id));
      expect(flowing).toEqual([]);
      await page.context().close();
    });

    // Spec 5.0: the gold element is on screen from first paint; at S 0 it is the underline of the zoom word.
    test(`the gold underline shows at the top of the hero at ${sizeOf(viewport)} on ${path}`, async ({
      browser,
    }) => {
      const page = await open(browser, viewport, path);
      const measure = () =>
        page.evaluate(() => {
          const gold = document.querySelector('[data-gold]') as HTMLElement;
          const shows =
            getComputedStyle(gold.parentElement as HTMLElement).display !== 'none' &&
            getComputedStyle(gold).visibility === 'visible';
          const g = gold.getBoundingClientRect();
          const k = (document.querySelector('#hero [data-key]') as HTMLElement).getBoundingClientRect();
          return { shows, dx: Math.abs(g.left - k.left), dw: Math.abs(g.width - k.width), g, k };
        });
      // it draws in after the headline builds
      await expect
        .poll(
          async () => {
            const m = await measure();
            return m.shows ? Math.max(m.dx, m.dw) : Number.POSITIVE_INFINITY;
          },
          { timeout: 6000 },
        )
        .toBeLessThanOrEqual(1);
      const { g, k } = await measure();
      expect(g.height).toBeLessThan(12);
      expect(g.top).toBeGreaterThanOrEqual(k.top + k.height * 0.75);
      expect(g.bottom).toBeLessThanOrEqual(k.bottom + 2);
      await page.context().close();
    });
  }

  // The ring is smallest on short phones: every stage's name and tools stay clear of the stations and the mark.
  for (const viewport of ALL.filter((v) => v.mobile)) {
    test(`the about ring's centre never covers a station at ${sizeOf(viewport)} on ${path}`, async ({
      browser,
    }) => {
      const page = await open(browser, viewport, path);
      await gotoScene(page, 'about', 0.5);
      const covered = await page.evaluate(() => {
        const about = document.getElementById('about') as HTMLElement;
        const names = [...about.querySelectorAll('[data-station] [data-station-name]')].map(
          (n) => n.textContent ?? '',
        );
        const tools = [...about.querySelectorAll('[data-station] .sr-only')].map(
          (n) => n.textContent?.trim() ?? '',
        );
        const name = about.querySelector('[data-stage-name] span') as HTMLElement;
        const list = about.querySelector('[data-stage-tools]') as HTMLElement;
        const hits = (a: DOMRect, b: DOMRect): boolean =>
          a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;
        const others = [...about.querySelectorAll('[data-node], [data-loop-mark]')].map((n) =>
          n.getBoundingClientRect(),
        );
        // every stage in turn, as the loop shows them (it is frozen on the first one here)
        return names.flatMap((stage, i) => {
          name.textContent = stage;
          list.textContent = tools[i] ?? '';
          const text = [name.getBoundingClientRect(), list.getBoundingClientRect()];
          return text.some((t) => others.some((o) => hits(t, o))) ? [stage] : [];
        });
      });
      expect(covered).toEqual([]);
      await page.context().close();
    });
  }

  for (const viewport of ALL) {
    // the existing "no blank screen" checks (home.spec.ts), at real short sizes: exactly one active scene, and
    // something readable or the gold element on screen at every scroll position
    test(`there is no blank screen between scenes at ${sizeOf(viewport)} on ${path}`, async ({ browser }) => {
      test.setTimeout(90_000);
      const page = await open(browser, viewport, path);
      await expectNoBlankScreen(page);
      await page.context().close();
    });
  }
}

// The phone headline is sized by both axes (hero.css): the width term on portrait phones, the height term on the
// widest phone layout when it is short, and the clamp floor on landscape phones, where every scene flows anyway.
const HEADLINE_SIZES = [
  { width: 390, height: 844, mobile: true, en: 46.8, ar: 48.36 },
  { width: 412, height: 839, mobile: true, en: 49.44, ar: 51.09 },
  { width: 860, height: 700, mobile: false, en: 84, ar: 77.5 },
  { width: 844, height: 390, mobile: true, en: 36, ar: 40 },
];
for (const path of ['/', '/ar'] as const) {
  for (const size of HEADLINE_SIZES) {
    test(`the phone headline size at ${size.width}x${size.height} on ${path}`, async ({ browser }) => {
      const page = await open(browser, size, path);
      const px = await page
        .locator('#hero h1')
        .evaluate((h1) => Number.parseFloat(getComputedStyle(h1).fontSize));
      expect(px).toBeCloseTo(path === '/' ? size.en : size.ar, 1);
      await page.context().close();
    });
  }
}
