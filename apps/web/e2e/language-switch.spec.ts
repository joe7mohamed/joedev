import { expect, type Page } from '@playwright/test';
import { gotoScene, progressOf, test } from './helpers';

/** Spec 5.2 and 9: the language switch changes the route and keeps the scroll position. */

/** The section under the top third of the screen, and how far through its box that point is. */
const placeOf = (page: Page) =>
  page.evaluate(() => {
    const y = window.innerHeight / 3;
    for (const section of document.querySelectorAll<HTMLElement>('[data-scene]')) {
      const box = section.getBoundingClientRect();
      if (box.top <= y && box.bottom > y) return { id: section.id, fraction: (y - box.top) / box.height };
    }
    return { id: '', fraction: 0 };
  });

const switchLanguage = async (page: Page, to: string): Promise<void> => {
  await page.locator(`header a[hreflang="${to}"]`).click();
  await page.waitForURL(`**/${to}`);
  await page.evaluate(() => document.fonts.ready.then(() => undefined));
};

test('the language switch keeps the position on the stacked page', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/en');
  await page.evaluate(() => document.fonts.ready.then(() => undefined));
  // a third of the way into the process section
  await page.evaluate(() => {
    const box = (document.getElementById('process') as HTMLElement).getBoundingClientRect();
    window.scrollTo({
      top: window.scrollY + box.top + box.height / 3 - window.innerHeight / 3,
      behavior: 'instant',
    });
  });
  const before = await placeOf(page);
  expect(before.id).toBe('process');
  await switchLanguage(page, 'ar');
  await expect.poll(async () => (await placeOf(page)).id).toBe('process');
  expect(Math.abs((await placeOf(page)).fraction - before.fraction)).toBeLessThan(0.1);
});

test('the language switch keeps the scene and the progress through it on the pinned page', async ({
  page,
}) => {
  await page.goto('/en');
  await gotoScene(page, 'process', 0.5);
  await switchLanguage(page, 'ar');
  await expect.poll(() => progressOf(page, 'process'), { timeout: 5000 }).toBeCloseTo(0.5, 1);
});
