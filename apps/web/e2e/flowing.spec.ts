import { expect, type Page } from '@playwright/test';
import { expectNoBlankScreen, gotoScene, test, untilBuilt } from './helpers';

/**
 * Spec 6.4: a scene whose content does not fit one viewport flows at natural height, and only it has no gold element.
 * Its pinned neighbours keep theirs and never leave the screen blank. Here the work scene is made taller than any
 * screen, so it flows between a pinned hero and a pinned process.
 */
const flowWork = async (page: Page, path = '/en'): Promise<void> => {
  await page.goto(path);
  await expect(page.locator('html')).toHaveClass(/enhanced/);
  await page.addStyleTag({ content: '#work [data-sticky] > [data-fade]{min-height:150svh}' });
  await page.evaluate(() => window.dispatchEvent(new Event('resize')));
  await expect(page.locator('#work')).toHaveAttribute('data-unpinned', 'true');
  await expect(page.locator('#hero')).not.toHaveAttribute('data-unpinned');
  await expect(page.locator('#process')).not.toHaveAttribute('data-unpinned');
  await untilBuilt(page);
};

/** The gold element's box, whether it shows, and the box of a slot. */
const goldAndSlot = (page: Page, slot: string) =>
  page.evaluate((selector) => {
    const gold = document.querySelector('[data-gold]') as HTMLElement;
    const g = gold.getBoundingClientRect();
    const s = (document.querySelector(selector) as HTMLElement).getBoundingClientRect();
    return {
      shows:
        getComputedStyle(gold.parentElement as HTMLElement).display !== 'none' &&
        getComputedStyle(gold).visibility === 'visible',
      g: { x: g.left, y: g.top, w: g.width, h: g.height },
      s: { x: s.left, y: s.top, w: s.width, h: s.height },
    };
  }, slot);

for (const path of ['/en', '/ar']) {
  test(`one scene that flows does not hide the gold element from the pinned scenes on ${path}`, async ({
    page,
  }) => {
    await flowWork(page, path);
    await gotoScene(page, 'hero', 0);
    await expect.poll(async () => (await goldAndSlot(page, '#hero [data-key] [data-slot]')).shows).toBe(true);
    await gotoScene(page, 'about', 0.5);
    const ring = await goldAndSlot(page, '#about [data-loop] [data-slot]');
    expect(ring.shows).toBe(true);
    expect(Math.abs(ring.g.x - ring.s.x)).toBeLessThanOrEqual(1);
    expect(Math.abs(ring.g.y - ring.s.y)).toBeLessThanOrEqual(1);
    expect(Math.abs(ring.g.w - ring.s.w)).toBeLessThanOrEqual(1);
    await gotoScene(page, 'process', 0.5);
    const rail = await goldAndSlot(page, '#process [data-rail-line]');
    expect(rail.shows).toBe(true);
    expect(rail.g.h).toBeLessThan(12);
    expect(Math.abs(rail.g.y + rail.g.h / 2 - rail.s.y)).toBeLessThanOrEqual(1);
  });

  test(`a pinned hero before a scene that flows never leaves the screen blank on ${path}`, async ({
    page,
  }) => {
    test.setTimeout(90_000);
    await flowWork(page, path);
    await expectNoBlankScreen(page);
  });
}

// Refitting (a resize, the phone's address bar, fonts) measures every scene with nothing flowing for a moment; the
// browser's scroll anchoring must not move the page while it does.
test('refitting while a scene flows does not move the page', async ({ page }) => {
  await flowWork(page);
  await gotoScene(page, 'about', 0.5);
  const before = await page.evaluate(() => window.scrollY);
  for (let i = 0; i < 3; i++) {
    await page.evaluate(() => window.dispatchEvent(new Event('resize')));
    await page.waitForTimeout(200);
  }
  expect(await page.evaluate(() => window.scrollY)).toBe(before);
  await expect(page.locator('#about')).toHaveAttribute('data-state', 'active');
  await expect(page.locator('html')).toHaveAttribute('data-gold-on', 'about');
});

test('the gold element never sits on a scene that flows', async ({ page }) => {
  await flowWork(page);
  // the middle of the flowing work scene fills the screen
  await page.evaluate(() => {
    const work = document.getElementById('work') as HTMLElement;
    const box = work.getBoundingClientRect();
    window.scrollTo({
      top: box.top + window.scrollY + box.height / 2 - window.innerHeight / 2,
      behavior: 'instant',
    });
  });
  await page.waitForTimeout(300);
  const onScreen = await page.evaluate(() => {
    const gold = document.querySelector('[data-gold]') as HTMLElement;
    const g = gold.getBoundingClientRect();
    const visible = getComputedStyle(gold).visibility === 'visible';
    return visible && g.bottom > 0 && g.top < window.innerHeight;
  });
  expect(onScreen).toBe(false);
});

// Spec 5.5: the stations are joined by the gold line. Whenever the gold element is not on the rail, the rail draws the
// same line itself.
test('the process rail draws its own line whenever the gold element is not on it', async ({ page }) => {
  await page.goto('/en');
  await gotoScene(page, 'process', 0.5);
  const line = () =>
    page.evaluate(() => {
      const slot = document.querySelector('#process [data-rail-line]') as HTMLElement;
      const before = getComputedStyle(slot, '::before');
      const gold = (document.querySelector('[data-gold]') as HTMLElement).getBoundingClientRect();
      return {
        drawn: before.content !== 'none' && before.display !== 'none',
        width: Number.parseFloat(before.width) || 0,
        gold: gold.width,
      };
    });
  await expect(page.locator('html')).toHaveAttribute('data-gold-on', 'process');
  expect((await line()).drawn).toBe(false);
  // the gold element is not on the rail: the rail's own line appears, as long as the gold one would be
  await page.evaluate(() => document.documentElement.removeAttribute('data-gold-on'));
  const own = await line();
  expect(own.drawn).toBe(true);
  expect(own.width).toBeGreaterThan(0);
  expect(Math.abs(own.width - own.gold)).toBeLessThanOrEqual(2);
});
