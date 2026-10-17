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

test('project text is fully opaque after rapid scrolling between projects', async ({ page }) => {
  await page.goto('/ar');
  for (const f of [0.2, 0.5, 0.85, 0.2, 0.55, 0.15, 0.9, 0.5]) {
    await page.evaluate((fraction) => {
      const el = document.getElementById('work') as HTMLElement;
      window.scrollTo({
        top: el.offsetTop + (el.offsetHeight - window.innerHeight) * 0.75 * fraction,
        behavior: 'instant',
      });
    }, f);
    await page.waitForTimeout(90);
  }
  await page.waitForTimeout(1500);
  const opacities = await page
    .locator('#work [data-current] :is(h3, p, li, a, figure)')
    .evaluateAll((els) => els.map((el) => Number(getComputedStyle(el).opacity)));
  expect(Math.min(...opacities)).toBe(1);
});

// Spec 6.4: a pinned work scene must fit its tallest project, not only the one in view when the fit was measured.
const workFits = async (page: Page, label: string): Promise<void> => {
  for (let i = 0; i < 3; i++) {
    await gotoScene(page, 'work', (i + 0.5) / 3);
    const fit = await page.evaluate(() => {
      const section = document.getElementById('work') as HTMLElement;
      if (section.hasAttribute('data-unpinned')) return { unpinned: true, inside: true };
      const sticky = section.querySelector('[data-sticky]') as HTMLElement;
      const style = getComputedStyle(sticky);
      const box = sticky.getBoundingClientRect();
      const link = (
        section.querySelector('[data-current] [data-visit]') as HTMLElement
      ).getBoundingClientRect();
      const top = box.top + Number.parseFloat(style.paddingTop);
      const bottom = box.bottom - Number.parseFloat(style.paddingBottom);
      return { unpinned: false, inside: link.top >= top - 1 && link.bottom <= bottom + 1 };
    });
    expect(fit.inside, `${label}, project ${i + 1}`).toBe(true);
  }
};

test('the work scene is pinned only if every project fits, else it flows', async ({ page }) => {
  await page.setViewportSize({ width: 820, height: 360 });
  await page.goto('/ar');
  await expect(page.locator('html')).toHaveClass(/enhanced/);
  await page.addStyleTag({ content: 'html{font-size:200%}' });
  await page.evaluate(() => window.dispatchEvent(new Event('resize')));
  await page.waitForTimeout(400);
  await workFits(page, 'large text');
  for (const [path, width, height] of [
    ['/en', 900, 500],
    ['/ar', 1440, 740],
    // the first project fits a phone this tall, the second (two-line Arabic description) does not
    ['/ar', 412, 800],
  ] as const) {
    await page.setViewportSize({ width, height });
    await page.goto(path);
    await workFits(page, `${path} ${width}x${height}`);
  }
});

for (const path of ['/en', '/ar']) {
  test(`rail line passes through every station centre on ${path}`, async ({ page }) => {
    await page.goto(path);
    await gotoScene(page, 'process', 0.97);
    const off = await page.evaluate(() => {
      const mid = (el: Element) => {
        const r = el.getBoundingClientRect();
        return r.top + r.height / 2;
      };
      const line = mid(document.querySelector('[data-gold]') as Element);
      return Math.max(
        ...[...document.querySelectorAll('#process [data-station]')].map((s) => Math.abs(mid(s) - line)),
      );
    });
    expect(off).toBeLessThanOrEqual(1);
  });
}

test('LIVE badge reads left to right in Arabic', async ({ page }) => {
  await page.goto('/ar');
  await gotoScene(page, 'process', 1);
  const direction = await page
    .locator('#process svg')
    .first()
    .evaluate((el) => getComputedStyle(el).direction);
  expect(direction).toBe('ltr');
});

// Spec 5.0 / 5.5: the rail line starts on the first station (the right one in Arabic) and its length is the
// progress through the steps; also makes sure the station-centre test above has five stations to measure.
for (const path of ['/en', '/ar']) {
  test(`rail line grows from the first station on ${path}`, async ({ page }) => {
    await page.goto(path);
    await gotoScene(page, 'process', 0.3);
    const m = await page.evaluate(() => {
      const centre = (el: Element) => {
        const r = el.getBoundingClientRect();
        return r.left + r.width / 2;
      };
      const stations = [...document.querySelectorAll('#process [data-station]')].map(centre);
      const gold = (document.querySelector('[data-gold]') as Element).getBoundingClientRect();
      return { stations, left: gold.left, right: gold.right, width: gold.width };
    });
    expect(m.stations).toHaveLength(5);
    const first = m.stations[0] as number;
    const span = Math.abs((m.stations[4] as number) - first);
    // body 0.3 of five steps: the line has reached 0.3 × 5 / 4 of the way to the last station
    expect(Math.abs(m.width - span * 0.375)).toBeLessThan(4);
    expect(Math.abs((path === '/ar' ? m.right : m.left) - first)).toBeLessThanOrEqual(1);
  });
}

// Review focus (spec 6.5): fast back-and-forth scrolling between steps must still end on the right, fully opaque text.
test('step text is fully opaque and current after rapid scrolling between steps', async ({ page }) => {
  await page.goto('/ar');
  await gotoScene(page, 'process', 0.1);
  for (const f of [0.3, 0.7, 0.95, 0.1, 0.5, 0.9, 0.3, 0.5]) {
    await page.evaluate((fraction) => {
      const el = document.getElementById('process') as HTMLElement;
      const viewport = window.innerHeight;
      const body = el.offsetHeight - viewport - Number(el.dataset.tail) * viewport;
      window.scrollTo({ top: el.offsetTop + body * fraction, behavior: 'instant' });
    }, f);
    await page.waitForTimeout(90);
  }
  await page.waitForTimeout(1500);
  await expect(page.locator('#process [data-step-name]')).toHaveText('أبني');
  // each element must be visible (no ancestor hidden or at opacity 0) and its effective opacity, its own times
  // every ancestor's, must be 1, so a stuck fade anywhere above the text is caught as well
  const unseen = await page.locator('#process [data-current] :is(h3, h3 span, p, li)').evaluateAll((els) =>
    els
      .filter((el) => {
        let opacity = 1;
        for (let node: Element | null = el; node; node = node.parentElement)
          opacity *= Number(getComputedStyle(node).opacity);
        return !el.checkVisibility({ opacityProperty: true, visibilityProperty: true }) || opacity < 1;
      })
      .map((el) => el.outerHTML.slice(0, 80)),
  );
  expect(unseen).toEqual([]);
});

// The rail line is the gold element with nothing of the project frame's float or tilt (Task 7's face).
for (const path of ['/en', '/ar']) {
  test(`the rail line neither floats nor tilts on ${path}`, async ({ page }) => {
    await page.goto(path);
    await gotoScene(page, 'process', 0.97);
    const m = await page.evaluate(() => {
      const gold = document.querySelector('[data-gold]') as HTMLElement;
      const box = gold.getBoundingClientRect();
      const face = (gold.querySelector('[data-gold-face]') as HTMLElement).getBoundingClientRect();
      const off = Math.max(
        Math.abs(face.left - box.left),
        Math.abs(face.top - box.top),
        Math.abs(face.width - box.width),
        Math.abs(face.height - box.height),
      );
      return { tilt: gold.hasAttribute('data-tilt'), off };
    });
    expect(m.tilt).toBe(false);
    expect(m.off).toBeLessThanOrEqual(0.5);
  });
}
