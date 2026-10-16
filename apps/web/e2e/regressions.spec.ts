import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';
import { gotoScene, test } from './helpers';

const gap = (page: Page, slot: string) =>
  page.evaluate((selector) => {
    const g = (document.querySelector('[data-gold]') as HTMLElement).getBoundingClientRect();
    const s = (document.querySelector(selector) as HTMLElement).getBoundingClientRect();
    return { dx: Math.abs(g.left - s.left), dy: Math.abs(g.top - s.top), dw: Math.abs(g.width - s.width) };
  }, slot);

for (const path of ['/en', '/ar']) {
  test(`gold element sits on the work slot on ${path}`, async ({ page }) => {
    await page.goto(path);
    await gotoScene(page, 'work', 0.5);
    const d = await gap(page, '#work [data-slot]');
    expect(d.dx).toBeLessThanOrEqual(1);
    expect(d.dy).toBeLessThanOrEqual(1);
    expect(d.dw).toBeLessThanOrEqual(2);
  });
}

test('gold element stays on its slot when the page is shifted sideways (start-side scrollbar)', async ({
  page,
}) => {
  await page.goto('/ar');
  await page.addStyleTag({ content: 'main{margin-left:16px}' });
  await page.evaluate(() => window.dispatchEvent(new Event('resize')));
  await gotoScene(page, 'work', 0.5);
  const d = await gap(page, '#work [data-slot]');
  expect(d.dx).toBeLessThanOrEqual(1);
});

test('gold element follows its own layer when a scrollbar shifts the fixed containing block', async ({
  page,
}) => {
  await page.goto('/ar');
  await page.addStyleTag({ content: 'html.enhanced [data-gold-layer]{left:16px} main{margin-left:16px}' });
  await page.evaluate(() => window.dispatchEvent(new Event('resize')));
  await gotoScene(page, 'work', 0.5);
  const d = await gap(page, '#work [data-slot]');
  expect(d.dx).toBeLessThanOrEqual(1);
  expect(d.dy).toBeLessThanOrEqual(1);
  expect(d.dw).toBeLessThanOrEqual(2);
});

test('gold element re-aligns after a viewport resize', async ({ page }) => {
  await page.goto('/en');
  await gotoScene(page, 'work', 0.5);
  await page.setViewportSize({ width: 1100, height: 700 });
  await page.waitForTimeout(400);
  const d = await gap(page, '#work [data-slot]');
  expect(d.dx).toBeLessThanOrEqual(1);
  expect(d.dy).toBeLessThanOrEqual(1);
});
