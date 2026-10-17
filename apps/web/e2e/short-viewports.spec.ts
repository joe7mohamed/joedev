import { type Browser, expect, type Page } from '@playwright/test';
import { expectNoBlankScreen, test, untilBuilt } from './helpers';

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
/** Where every scene must pin: the commonest iPhone and laptop sizes. */
const MUST_PIN = SHORT.filter((v) => (v.width === 390 && v.height === 664) || v.width === 1366);
const sizeOf = (v: (typeof SHORT)[number]): string => `${v.width}x${v.height}`;

const open = async (browser: Browser, viewport: (typeof SHORT)[number], path: string): Promise<Page> => {
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

for (const path of ['/en', '/ar']) {
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

  for (const viewport of SHORT) {
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
