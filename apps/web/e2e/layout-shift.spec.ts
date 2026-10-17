import { type Browser, expect, test } from '@playwright/test';

/**
 * Cumulative layout shift from the first paint until 2 s after the app takes over (`html.enhanced`), on a fresh visit
 * (the loading screen shows) and on a repeat visit. The pinned layout must already be in place before hydration, so
 * the takeover moves nothing (Lighthouse's CLS budget, 0.05). Every shift counts, not only the worst session window.
 */
const MAX_CLS = 0.05;
/** Lighthouse's mobile CPU slowdown: without it hydration can beat the first paint and hide a shift. */
const CPU_SLOWDOWN = 4;
const SETTLE_MS = 2000;
/** The preloaded display faces (fonts/display.ts); every other face is held back this long in the late-fonts case. */
const HEADLINE_FACES = /\/(fraunces-latin|amiri-bold)\.[^/]*woff2$/;
const LATE_FONT_MS = 1500;
/**
 * Lighthouse's mobile viewport, the desktop one the other specs use, and the real short sizes: iPhone Safari's small
 * viewport with its toolbars (360 x 640, 390 x 664) and laptop Chrome (1280 x 632, 1366 x 657, 1536 x 730), then large
 * phones, an 860 x 700 window and the 768 x 1024 tablet.
 */
const VIEWPORTS = [
  { width: 412, height: 823, mobile: true },
  { width: 1440, height: 900, mobile: false },
  { width: 360, height: 640, mobile: true },
  { width: 390, height: 664, mobile: true },
  { width: 1280, height: 632, mobile: false },
  { width: 1366, height: 657, mobile: false },
  { width: 1536, height: 730, mobile: false },
  // the large phones, the short wide window and the tablet (owner decision 2026-10-17)
  { width: 414, height: 832, mobile: true },
  { width: 428, height: 836, mobile: true },
  { width: 430, height: 832, mobile: true },
  { width: 860, height: 700, mobile: false },
  { width: 768, height: 1024, mobile: true },
];

const measure = async (
  browser: Browser,
  path: string,
  viewport: (typeof VIEWPORTS)[number],
  seen: boolean,
  lateFonts = false,
) => {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    isMobile: viewport.mobile,
    hasTouch: viewport.mobile,
  });
  const page = await context.newPage();
  // the body and mono faces are not preloaded: on a slow network they arrive well after the first paint
  if (lateFonts)
    await page.route(/\.woff2$/, async (route) => {
      if (!HEADLINE_FACES.test(route.request().url()))
        await new Promise((done) => setTimeout(done, LATE_FONT_MS));
      await route.continue();
    });
  const cdp = await context.newCDPSession(page);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: CPU_SLOWDOWN });
  await page.addInitScript((intro) => {
    if (intro) sessionStorage.setItem('zk-intro', '1');
    const w = window as unknown as { shifts: string[]; cls: number };
    w.shifts = [];
    w.cls = 0;
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as unknown as {
        value: number;
        startTime: number;
        hadRecentInput: boolean;
        sources: { node?: Node | null; previousRect: DOMRectReadOnly; currentRect: DOMRectReadOnly }[];
      }[]) {
        if (entry.hadRecentInput) continue;
        w.cls += entry.value;
        const nodes = entry.sources.map((s) => {
          const el = s.node as Element | null;
          const name = el?.id || [el?.nodeName, ...[...(el?.attributes ?? [])].map((a) => a.name)].join(' ');
          const [a, b] = [s.previousRect, s.currentRect];
          return `${name} (${Math.round(a.x)},${Math.round(a.y)} ${Math.round(a.width)}x${Math.round(a.height)} -> ${Math.round(b.x)},${Math.round(b.y)} ${Math.round(b.width)}x${Math.round(b.height)})`;
        });
        w.shifts.push(`${Math.round(entry.startTime)} ms ${entry.value.toFixed(3)} ${nodes.join(',')}`);
      }
    }).observe({ type: 'layout-shift', buffered: true });
  }, seen);
  await page.goto(path);
  await page.waitForFunction(() => document.documentElement.classList.contains('enhanced'));
  await page.waitForTimeout(SETTLE_MS);
  const result = await page.evaluate(() => {
    const w = window as unknown as { shifts: string[]; cls: number };
    return { cls: w.cls, shifts: w.shifts };
  });
  await context.close();
  return result;
};

test.beforeEach(({ browser: _ }, testInfo) => {
  // the viewports are set here, so one project is enough
  test.skip(testInfo.project.name !== 'desktop', 'viewports are explicit');
});

test('without the app the first scene is readable, and the page falls back to stacked after 6 s', async ({
  page,
}) => {
  // the app's scripts never arrive; the inline head script still runs (loader already seen: it holds the hero itself)
  await page.addInitScript(() => sessionStorage.setItem('zk-intro', '1'));
  await page.route('**/_next/static/chunks/*.js', (route) => route.abort());
  await page.goto('/');
  const html = page.locator('html');
  await expect(html).toHaveClass(/\bpinned\b/);
  await expect(html).not.toHaveClass(/\benhanced\b/);
  const headline = page.locator('#hero h1');
  await expect(headline).toBeInViewport();
  expect(
    await headline.evaluate((el) => Number(getComputedStyle(el.closest('[data-fade]') ?? el).opacity)),
  ).toBe(1);
  await expect(html).not.toHaveClass(/\bpinned\b/, { timeout: 8000 });
  await expect(headline).toBeInViewport();
});

for (const path of ['/', '/ar']) {
  for (const viewport of VIEWPORTS) {
    for (const seen of [false, true]) {
      const visit = seen ? 'repeat' : 'first';
      test(`no layout shift as the app takes over: ${path} ${viewport.width}x${viewport.height} ${visit} visit`, async ({
        browser,
      }) => {
        const { cls, shifts } = await measure(browser, path, viewport, seen);
        test.info().annotations.push({ type: 'cls', description: cls.toFixed(4) });
        expect(cls, shifts.join('\n')).toBeLessThanOrEqual(MAX_CLS);
      });
    }
  }
}

// The body and mono faces swap in after the first paint over metric-matched fallbacks, so even when they arrive late
// nothing moves. Linux and Android have no Arial, so the fallbacks must also name its metric-compatible look-alikes.
for (const path of ['/', '/ar']) {
  for (const viewport of VIEWPORTS.slice(0, 2)) {
    test(`no layout shift when the body faces arrive late: ${path} ${viewport.width}x${viewport.height}`, async ({
      browser,
    }) => {
      const { cls, shifts } = await measure(browser, path, viewport, true, true);
      test.info().annotations.push({ type: 'cls', description: cls.toFixed(4) });
      expect(cls, shifts.join('\n')).toBeLessThanOrEqual(MAX_CLS);
    });
  }
}
