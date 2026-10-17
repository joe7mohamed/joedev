import type { Page } from '@playwright/test';
import { test as base } from '@playwright/test';

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
