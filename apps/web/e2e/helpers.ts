import type { Page } from '@playwright/test';
import { test as base, expect } from '@playwright/test';

/** Tests that are not about the loader start with it already seen. */
export const test = base.extend({
  page: async ({ page }, use) => {
    await page.addInitScript(() => {
      try {
        sessionStorage.setItem('zk-intro', '1');
      } catch {
        // storage unavailable: the loader has its own timeout
      }
    });
    await use(page);
  },
});

/** Scroll so that the scene's body progress equals `fraction` (0..1). */
export const gotoScene = async (page: Page, id: string, fraction: number): Promise<void> => {
  // before hydration the page is stacked and short; measuring then would aim at the wrong layout
  await page.waitForFunction(() => document.documentElement.classList.contains('enhanced'));
  await page.evaluate(
    ([sceneId, f]) => {
      const el = document.getElementById(sceneId as string) as HTMLElement;
      const sticky = el.querySelector('[data-sticky]') as HTMLElement;
      const viewport = sticky.clientHeight || window.innerHeight;
      const travel = Math.max(0, el.offsetHeight - viewport);
      const body = Math.max(0, travel - Number(el.dataset.tail ?? 0) * viewport);
      const top = el.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: top + body * (f as number), behavior: 'instant' });
    },
    [id, fraction] as const,
  );
  await page.waitForTimeout(700);
};

export const progressOf = (page: Page, id: string): Promise<number> =>
  page.evaluate(
    (sceneId) =>
      Number(getComputedStyle(document.getElementById(sceneId) as HTMLElement).getPropertyValue('--p')),
    id,
  );

/**
 * Brings the page to rest for a check that reads rendered styles (axe colour contrast). Every finite animation
 * jumps to its end, which is the resting style, and the looping ones pause. Any animation a timer starts during
 * the check (the rotating word flips every 2.4 s) jumps straight to its end as well. The page's clock is not
 * paused: axe itself runs on timers and would never finish.
 */
export const settle = async (page: Page): Promise<void> => {
  await page.waitForFunction(() => document.documentElement.classList.contains('enhanced'));
  await page.evaluate(() => {
    const rest = (animation: Animation): void => {
      if (animation.effect?.getComputedTiming().iterations === Infinity) animation.pause();
      else animation.finish();
    };
    const animate = Element.prototype.animate;
    Element.prototype.animate = function (this: Element, ...args: Parameters<Element['animate']>) {
      const animation = animate.apply(this, args);
      rest(animation);
      return animation;
    };
    for (const animation of document.getAnimations()) rest(animation);
  });
};

/** The hero builds in from first paint: waits until every one-shot animation on the page has finished. */
export const untilBuilt = (page: Page): Promise<unknown> =>
  page.waitForFunction(
    () =>
      document
        .getAnimations()
        .every((a) => a.playState !== 'running' || a.effect?.getComputedTiming().iterations === Infinity),
    undefined,
    { timeout: 10_000 },
  );

/**
 * What the visitor sees at this scroll position: the gold element, or some scene text that is on screen and fully
 * opaque (counting every ancestor's opacity, so a faded scene or a zoomed-away headline does not count). The zoom
 * word counts by its ink and its screenshot fill (its ::after) together, which cross-fade. Null means a blank screen.
 */
export const shown = (page: Page): Promise<string | null> =>
  page.evaluate(() => {
    const onScreen = (r: DOMRect): boolean =>
      r.width > 0 &&
      r.height > 0 &&
      r.bottom > 0 &&
      r.top < window.innerHeight &&
      r.right > 0 &&
      r.left < window.innerWidth;
    const opacityAbove = (el: Element | null): number => {
      let o = 1;
      for (let p = el; p; p = p.parentElement) o *= Number(getComputedStyle(p).opacity);
      return o;
    };
    const gold = document.querySelector<HTMLElement>('[data-gold]');
    if (
      gold &&
      getComputedStyle(gold.parentElement as HTMLElement).display !== 'none' &&
      getComputedStyle(gold).visibility === 'visible' &&
      onScreen(gold.getBoundingClientRect())
    )
      return 'gold';
    for (const el of document.querySelectorAll<HTMLElement>('main [data-scene] *')) {
      const text = [...el.childNodes].some((n) => n.nodeType === Node.TEXT_NODE && n.textContent?.trim());
      if (!text || getComputedStyle(el).visibility !== 'visible') continue;
      if (onScreen(el.getBoundingClientRect()) && opacityAbove(el) >= 0.99)
        return el.closest('[data-scene]')?.id ?? 'text';
    }
    for (const key of document.querySelectorAll<HTMLElement>('#hero [data-key]')) {
      // its letters cross-fade from ink to the screenshot: together they are the word
      const ink = key.querySelector('[data-ink]');
      const fill =
        Number(getComputedStyle(key, '::after').opacity) + Number(ink ? getComputedStyle(ink).opacity : 0);
      if (onScreen(key.getBoundingClientRect()) && fill * opacityAbove(key) >= 0.99) return 'zoom';
    }
    return null;
  });

/**
 * Spec 6.4, "there is never a blank screen": scrolls through the whole page and checks, at every step, that exactly
 * one scene is active and that something is on screen (`shown`).
 */
export const expectNoBlankScreen = async (page: Page, steps = 80): Promise<void> => {
  const total = await page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight);
  for (let y = 0; y <= total; y += Math.round(total / steps)) {
    await page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), y);
    await page.waitForTimeout(60);
    const active = await page.locator('[data-scene][data-state="active"]').count();
    expect(active, `active scenes at scroll ${y}`).toBe(1);
    expect(await shown(page), `something on screen at scroll ${y}`).not.toBeNull();
  }
};
