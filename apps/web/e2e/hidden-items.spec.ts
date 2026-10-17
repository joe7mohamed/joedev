import { expect, type Page } from '@playwright/test';
import { gotoScene, progressOf, test } from './helpers';

/**
 * Spec 6.4: "anchors, find-in-page, focus order and screen readers work natively". While the work and process scenes
 * play, only one project or step shows; the others are out of sight but stay in the accessibility tree, their bodies
 * wait to be found (hidden="until-found"), and finding or focusing one brings it into view.
 */

/** The text of every item's part that names it (projects: the name; steps: the sentence), read from the page. */
const texts = (page: Page, selector: string): Promise<string[]> =>
  page.locator(selector).evaluateAll((els) => els.map((el) => el.textContent?.trim() ?? ''));

test('every project name is in the accessibility tree while one project shows', async ({ page }) => {
  await page.goto('/');
  await gotoScene(page, 'work', 0.17);
  const names = await texts(page, '#work [data-item] [data-name]');
  expect(names).toHaveLength(3);
  for (const name of names)
    await expect(page.locator('#work').getByRole('heading', { level: 3, name, exact: true })).toHaveCount(1);
  // out of sight, not hidden from assistive technology
  const hidden = page.locator('#work [data-item]:not([data-current])');
  await expect(hidden).toHaveCount(2);
  for (const item of await hidden.all()) {
    await expect(item).not.toHaveAttribute('aria-hidden');
    await expect(item).not.toHaveAttribute('inert');
    expect(await item.evaluate((el) => getComputedStyle(el).visibility)).toBe('visible');
    expect(await item.evaluate((el) => Number(getComputedStyle(el).opacity))).toBe(0);
    await expect(item.locator('[data-item-body]')).toHaveAttribute('hidden', 'until-found');
  }
  await expect(page.locator('#work [data-item][data-current] [data-item-body]')).not.toHaveAttribute(
    'hidden',
  );
});

test('every process step sentence is in the accessibility tree while one step shows', async ({ page }) => {
  await page.goto('/');
  await gotoScene(page, 'process', 0.1);
  const sentences = await texts(page, '#process [data-item] [data-step-sentence]');
  expect(sentences).toHaveLength(5);
  const tree = await page.locator('#process').ariaSnapshot();
  for (const sentence of sentences) expect(tree).toContain(sentence);
  for (const item of await page.locator('#process [data-item]:not([data-current])').all()) {
    await expect(item).not.toHaveAttribute('aria-hidden');
    await expect(item).not.toHaveAttribute('inert');
    await expect(item.locator('[data-item-body]')).toHaveAttribute('hidden', 'until-found');
  }
});

for (const [scene, at, index, count] of [
  ['work', 0.17, 2, 3],
  ['process', 0.1, 3, 5],
] as const) {
  test(`focusing a ${scene} item that is out of sight scrolls to it`, async ({ page }) => {
    await page.goto('/');
    await gotoScene(page, scene, at);
    const target = (index + 0.5) / count;
    await page.locator(`#${scene} [data-item][data-index="${index}"]`).focus();
    await expect.poll(() => progressOf(page, scene), { timeout: 4000 }).toBeCloseTo(target, 1);
    await expect(page.locator(`#${scene} [data-item][data-current]`)).toHaveAttribute(
      'data-index',
      String(index),
    );
    // the focus follows the item into view
    await expect(page.locator(`#${scene} [data-item][data-current]`)).toBeFocused();
  });

  test(`finding text in a ${scene} item that is out of sight scrolls to it`, async ({ page }) => {
    await page.goto('/');
    await gotoScene(page, scene, at);
    // what the browser does when find-in-page matches inside hidden="until-found": beforematch, then it reveals
    await page.locator(`#${scene} [data-item][data-index="${index}"] [data-item-body]`).evaluate((body) => {
      body.dispatchEvent(new Event('beforematch', { bubbles: true }));
      body.removeAttribute('hidden');
    });
    await expect.poll(() => progressOf(page, scene), { timeout: 4000 }).toBeCloseTo((index + 0.5) / count, 1);
    await expect(page.locator(`#${scene} [data-item][data-current]`)).toHaveAttribute(
      'data-index',
      String(index),
    );
  });
}

test('projects out of sight add no tab stops to the work scene', async ({ page }) => {
  await page.goto('/');
  await gotoScene(page, 'work', 0.17);
  await page.locator('#work [data-bars] button').first().focus();
  const stops: string[] = [];
  for (let i = 0; i < 8; i++) {
    const stop = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement | null;
      if (!el?.closest('#work')) return null;
      const item = el.closest<HTMLElement>('[data-item]');
      return `${el.tagName.toLowerCase()}${item ? `@${item.dataset.index}${item.hasAttribute('data-current') ? '*' : ''}` : ''}`;
    });
    if (!stop) break;
    stops.push(stop);
    await page.keyboard.press('Tab');
  }
  // the three bars, then the visit link of the project in view; nothing of the others
  expect(stops).toEqual(['button', 'button', 'button', 'a@0*']);
});
