import { expect, type Page } from '@playwright/test';
import { gotoScene, test } from './helpers';

/**
 * `?freeze=1` (E2E builds only) stops every time-based loop at its first state, so screenshots are stable (Task 13:
 * the visual snapshots and the AA guard). CSS keyframe loops are left to the screenshot's `animations: 'disabled'`.
 */

/** Longer than each loop needs to change: the title starts deleting about 5.3 s after the hero builds. */
const TITLE_WAIT_MS = 6500;
const LOOP_WAIT_MS = 2500;

const heroState = (page: Page) =>
  page.evaluate(() => {
    const hero = document.getElementById('hero') as HTMLElement;
    const word = hero.querySelector('[data-rot] > span:not([data-sizer])');
    const firstWord = hero.querySelector('[data-rot] > [data-sizer]');
    return {
      title: hero.querySelector('[data-typed]')?.textContent,
      firstTitle: hero.querySelector('[data-role] .sr-only')?.textContent,
      word: word?.textContent,
      firstWord: firstWord?.textContent,
    };
  });

const ringState = (page: Page) =>
  page.evaluate(() => {
    const about = document.getElementById('about') as HTMLElement;
    return {
      rotate: about.querySelector<HTMLElement>('[data-runner]')?.style.rotate ?? '',
      current: about.querySelector('[data-station][data-current]')?.getAttribute('data-index') ?? null,
    };
  });

test('the hero title and rotating word hold their first state', async ({ page }) => {
  await page.goto('/?freeze=1');
  await gotoScene(page, 'hero', 0);
  const before = await heroState(page);
  expect(before.title).toBe(before.firstTitle);
  expect(before.word).toBe(before.firstWord);
  await page.waitForTimeout(TITLE_WAIT_MS);
  expect(await heroState(page)).toEqual(before);
});

test('the hero underline is drawn in full at once', async ({ page }) => {
  await page.goto('/?freeze=1');
  await gotoScene(page, 'hero', 0);
  const widths = await page.evaluate(() => ({
    gold: (document.querySelector('[data-gold]') as HTMLElement).getBoundingClientRect().width,
    slot: (document.querySelector('#hero [data-slot]') as HTMLElement).getBoundingClientRect().width,
  }));
  expect(widths.slot).toBeGreaterThan(0);
  expect(Math.abs(widths.gold - widths.slot)).toBeLessThan(1);
});

test('the about ring rests on its first stage', async ({ page }) => {
  await page.goto('/?freeze=1');
  await gotoScene(page, 'about', 0.5);
  const before = await ringState(page);
  expect(before.current).toBe('0');
  await page.waitForTimeout(LOOP_WAIT_MS);
  expect(await ringState(page)).toEqual(before);
});

test('the background shader holds still', async ({ page }) => {
  await page.goto('/?bg=soft&freeze=1');
  const canvas = page.locator('canvas[data-bg]');
  await expect(canvas).toHaveCount(1, { timeout: 10_000 });
  test.skip(
    await canvas.evaluate((el) => (el as HTMLCanvasElement).hidden === true),
    'no WebGL in this browser',
  );
  await gotoScene(page, 'work', 0.5);
  // only the canvas: everything in front of it is transparent (visibility could be undone by a descendant)
  const shot = {
    style: 'body > :not([data-bg-host]) { opacity: 0 !important; }',
    animations: 'disabled',
  } as const;
  const before = await page.screenshot(shot);
  await page.waitForTimeout(LOOP_WAIT_MS);
  expect((await page.screenshot(shot)).equals(before)).toBe(true);
});
