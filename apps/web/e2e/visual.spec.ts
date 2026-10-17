import { expect } from '@playwright/test';
import { gotoScene, test } from './helpers';

/*
 * Visual snapshots. Font rendering differs between operating systems, so the baselines are made and compared only in
 * the Playwright Docker image (`npm run e2e:visual -w web`, and the CI `visual` job); the main e2e run skips @visual.
 * `?bg=soft` runs the shader on the image's software GL and `?freeze=1` stops the time-based loops (E2E builds only);
 * `animations: 'disabled'` settles the CSS ones.
 */
/** Software GL draws a full desktop frame slowly, and a stable screenshot needs two identical ones in a row. */
const SHOT_TIMEOUT_MS = 30_000;

const shots: Array<[string, number]> = [
  ['hero', 0],
  ['work', 0.17],
  ['work', 0.5],
  ['process', 0.5],
  ['process', 0.95],
  ['about', 0.5],
  ['contact', 1],
];

for (const path of ['/en', '/ar']) {
  for (const theme of ['dark', 'light']) {
    test(`visual: ${path} ${theme}`, { tag: '@visual' }, async ({ page }) => {
      test.setTimeout(shots.length * SHOT_TIMEOUT_MS);
      await page.addInitScript((t) => {
        localStorage.setItem('zk-theme', t);
      }, theme);
      await page.goto(`${path}?bg=soft&freeze=1`);
      // the background mounts once the page is idle; shoot only after it has (hidden if WebGL is missing)
      await expect(page.locator('canvas[data-bg]')).toHaveCount(1, { timeout: 10_000 });
      for (const [id, f] of shots) {
        await gotoScene(page, id, f);
        await expect(page).toHaveScreenshot(`${path.slice(1)}-${theme}-${id}-${f}.png`, {
          animations: 'disabled',
          maxDiffPixelRatio: 0.01,
          timeout: SHOT_TIMEOUT_MS,
        });
      }
    });
  }
}
