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
/** Lighthouse's mobile viewport, and the desktop one the other specs use. */
const VIEWPORTS = [
  { width: 412, height: 823, mobile: true },
  { width: 1440, height: 900, mobile: false },
];

const measure = async (
  browser: Browser,
  path: string,
  viewport: (typeof VIEWPORTS)[number],
  seen: boolean,
) => {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    isMobile: viewport.mobile,
    hasTouch: viewport.mobile,
  });
  const page = await context.newPage();
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
  await page.goto('/en');
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

for (const path of ['/en', '/ar']) {
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
