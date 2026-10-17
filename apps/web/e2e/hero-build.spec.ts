import { test as base, expect, type Page } from '@playwright/test';
import { test } from './helpers';

/**
 * Owner decision 2026-10-17: the hero builds in without the fade from invisible, so its text (the headline, the key
 * word, the rotating word and every row around them) is painted at full opacity from the first paint, and the largest
 * contentful paint is not held back by the build. The build moves (slides, tips, clips); it never fades.
 */
const BUILD_AT_MS = 100;

type HeroPaint = {
  intro: boolean;
  loading: boolean;
  /** one-shot hero animations still before their end */
  building: number;
  /** of those, how many are paused */
  paused: number;
  h1: number;
  key: number;
  /** text elements under #hero whose own or inherited opacity is below 1 */
  faint: string[];
  /** finite hero animations with a keyframe below full opacity */
  fades: string[];
};

const heroPaint = (page: Page): Promise<HeroPaint> =>
  page.evaluate(() => {
    const root = document.documentElement;
    const hero = document.getElementById('hero') as HTMLElement;
    // own and inherited opacity together: a faded ancestor hides its text as well
    const shownOpacity = (el: Element): number => {
      let o = 1;
      for (let node: Element | null = el; node; node = node.parentElement)
        o *= Number(getComputedStyle(node).opacity);
      return o;
    };
    const name = (el: Element): string =>
      [
        el.tagName.toLowerCase(),
        ...[...el.attributes].filter((a) => a.name.startsWith('data-')).map((a) => a.name),
      ]
        .join(' ')
        .concat(` "${(el.textContent ?? '').trim().slice(0, 24)}"`);
    const holdsText = (el: Element): boolean =>
      [...el.childNodes].some((n) => n.nodeType === Node.TEXT_NODE && (n.textContent ?? '').trim() !== '');
    const oneShot = hero
      .getAnimations({ subtree: true })
      .filter((a) => a.effect?.getComputedTiming().iterations !== Infinity);
    const building = oneShot.filter((a) => {
      const timing = a.effect?.getComputedTiming();
      return Number(a.currentTime ?? 0) < Number(timing?.endTime ?? 0);
    });
    const fades = oneShot.flatMap((a) => {
      const frames = a.effect instanceof KeyframeEffect ? a.effect.getKeyframes() : [];
      const low = frames.some((f) => f.opacity !== undefined && Number(f.opacity) < 1);
      return low
        ? [
            `${a instanceof CSSAnimation ? a.animationName : 'script'} on ${name((a.effect as KeyframeEffect).target as Element)}`,
          ]
        : [];
    });
    return {
      intro: root.classList.contains('intro'),
      loading: root.classList.contains('loading'),
      building: building.length,
      paused: building.filter((a) => a.playState === 'paused').length,
      h1: shownOpacity(hero.querySelector('h1') as Element),
      key: shownOpacity(hero.querySelector('[data-key]') as Element),
      faint: [...hero.querySelectorAll('*')].filter((el) => holdsText(el) && shownOpacity(el) < 1).map(name),
      fades: [...new Set(fades)],
    };
  });

for (const path of ['/', '/ar']) {
  test(`the hero is painted at full opacity while it builds on ${path}`, async ({ page }) => {
    await page.goto(path);
    await page.waitForTimeout(BUILD_AT_MS);
    const paint = await heroPaint(page);
    // the build is still running, with the loading screen already seen
    expect(paint.intro).toBe(true);
    expect(paint.loading).toBe(false);
    expect(paint.building).toBeGreaterThan(0);
    expect(paint.h1).toBe(1);
    expect(paint.key).toBe(1);
    expect(paint.faint).toEqual([]);
    // and at no moment of the build: no keyframe of it is below full opacity
    expect(paint.fades).toEqual([]);
  });

  // a first visit: the loading screen holds the build, and the hero under it is painted, but static
  base(`under the loading screen the hero is held, painted at full opacity, on ${path}`, async ({ page }) => {
    await page.goto(path);
    await page.waitForTimeout(BUILD_AT_MS);
    const paint = await heroPaint(page);
    base.skip(!paint.loading, 'the loading screen finished before the check');
    expect(paint.building).toBeGreaterThan(0);
    expect(paint.paused).toBe(paint.building);
    expect(paint.h1).toBe(1);
    expect(paint.key).toBe(1);
    expect(paint.faint).toEqual([]);
  });
}

// Spec 5.3 and the prototype (`rotationX: ar ? 0 : -85`): Arabic builds word by word with a rise only, never a tip.
test('the Arabic headline words rise without rotating while they build', async ({ page }) => {
  await page.goto('/ar');
  const frames = await page.evaluate(() => {
    const words = [...document.querySelectorAll<HTMLElement>('#hero [data-headline="words"] [data-word]')];
    const builds = words.flatMap((w) => w.getAnimations().filter((a) => a instanceof CSSAnimation));
    for (const a of builds) a.pause();
    // the first frame (every word still before its delay, at the start of the rise) and one mid-build
    return [0, 400].map((at) => {
      for (const a of builds) a.currentTime = at;
      return words.map((w) => {
        const m = new DOMMatrix(getComputedStyle(w).transform);
        return { m22: m.m22, m23: m.m23, m32: m.m32, m33: m.m33, m12: m.m12, m21: m.m21, y: m.m42 };
      });
    });
  });
  const [first, mid] = frames as [Matrices, Matrices];
  expect(first.length).toBeGreaterThan(0);
  // the build is under way: every word starts below its place
  expect(first.every((m) => m.y > 0)).toBe(true);
  for (const m of [...first, ...mid]) {
    expect(m.m22).toBeCloseTo(1, 5);
    expect(m.m33).toBeCloseTo(1, 5);
    for (const v of [m.m23, m.m32, m.m12, m.m21]) expect(v).toBeCloseTo(0, 5);
  }
});

type Matrices = { m22: number; m23: number; m32: number; m33: number; m12: number; m21: number; y: number }[];
