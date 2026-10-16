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
  await page.evaluate(
    ([sceneId, f]) => {
      const el = document.getElementById(sceneId as string) as HTMLElement;
      const sticky = el.querySelector('[data-sticky]') as HTMLElement;
      const viewport = sticky.clientHeight || window.innerHeight;
      const travel = Math.max(0, el.offsetHeight - viewport);
      const body = Math.max(0, travel - Number(el.dataset.tail ?? 0) * viewport);
      window.scrollTo({ top: el.offsetTop + body * (f as number), behavior: 'instant' });
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
