import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';
import { gotoScene, shown, test } from './helpers';

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

// Spec 6.4, never a blank screen: in the first pixels of the process scene the work frame has shrunk into the rail
// and the step text has not faded in yet, so the gold line must already show, as a dot on the first station.
for (const path of ['/en', '/ar']) {
  test(`the rail line shows from the first pixel of the process scene on ${path}`, async ({ page }) => {
    await page.goto(path);
    await gotoScene(page, 'process', 0);
    expect(await shown(page)).toBe('gold');
    const m = await page.evaluate(() => {
      const r = (document.querySelector('[data-gold]') as Element).getBoundingClientRect();
      const s = (document.querySelector('#process [data-station]') as Element).getBoundingClientRect();
      return { left: r.left, right: r.right, width: r.width, centre: s.left + s.width / 2 };
    });
    expect(m.width).toBeLessThanOrEqual(4);
    expect(Math.abs((path === '/ar' ? m.right : m.left) - m.centre)).toBeLessThanOrEqual(1);
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

for (const path of ['/en', '/ar']) {
  test(`loop station icons are centred on ${path}`, async ({ page }) => {
    await page.goto(path);
    await gotoScene(page, 'about', 0.5);
    const { worst, count } = await page.evaluate(() => {
      const nodes = [...document.querySelectorAll('#about [data-station] [data-node]')];
      const offsets = nodes.map((node) => {
        const a = node.getBoundingClientRect();
        const b = (node.querySelector('svg') as SVGElement).getBoundingClientRect();
        return Math.max(
          Math.abs(a.left + a.width / 2 - b.left - b.width / 2),
          Math.abs(a.top + a.height / 2 - b.top - b.height / 2),
        );
      });
      return { worst: Math.max(...offsets), count: nodes.length };
    });
    expect(count).toBe(7);
    expect(worst).toBeLessThanOrEqual(0.5);
  });
}

test('loop arc is empty while the first stage is current', async ({ page }) => {
  await page.goto('/ar');
  await gotoScene(page, 'about', 0.5);
  await expect
    .poll(async () => page.locator('#about [data-station][data-current="true"]').getAttribute('data-index'), {
      timeout: 20000,
    })
    .toBe('0');
  const sweep = await page
    .locator('#about [data-arc]')
    .evaluate((el) => Number(getComputedStyle(el).getPropertyValue('--a')));
  expect(sweep).toBe(0);
});

// The About ring is the gold element as a circle on its slot, with nothing of the project frame's float or tilt
// (Task 7's face).
for (const path of ['/en', '/ar']) {
  test(`the about ring sits on its slot and neither floats nor tilts on ${path}`, async ({ page }) => {
    await page.goto(path);
    await gotoScene(page, 'about', 0.5);
    const m = await page.evaluate(() => {
      const gold = document.querySelector('[data-gold]') as HTMLElement;
      const box = gold.getBoundingClientRect();
      const face = (gold.querySelector('[data-gold-face]') as HTMLElement).getBoundingClientRect();
      const slot = (document.querySelector('#about [data-slot]') as HTMLElement).getBoundingClientRect();
      const off = (a: DOMRect, b: DOMRect) =>
        Math.max(
          Math.abs(a.left - b.left),
          Math.abs(a.top - b.top),
          Math.abs(a.width - b.width),
          Math.abs(a.height - b.height),
        );
      return {
        visible: getComputedStyle(gold).visibility === 'visible',
        tilt: gold.hasAttribute('data-tilt'),
        face: off(face, box),
        slot: off(box, slot),
        circle: Number.parseFloat(getComputedStyle(gold).borderRadius) >= box.width / 2 - 0.5,
      };
    });
    expect(m.visible).toBe(true);
    expect(m.tilt).toBe(false);
    expect(m.face).toBeLessThanOrEqual(0.5);
    expect(m.slot).toBeLessThanOrEqual(1);
    expect(m.circle).toBe(true);
  });
}

// Review fix: the svh fit caps belong to the pinned scene only. A phone in landscape (844x390) cannot pin About, so it
// flows (and with reduced motion it is stacked): the ring keeps its full size and the centre never runs into the
// stations.
for (const path of ['/en', '/ar']) {
  test(`a flowing or stacked About keeps a full-size ring on a landscape phone on ${path}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 844, height: 390 });
    const measure = async (mode: string) => {
      await page.locator('#about [data-loop]').scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);
      const m = await page.evaluate(() => {
        const ring = (document.querySelector('#about [data-loop]') as HTMLElement).getBoundingClientRect();
        const tools = (
          document.querySelector('#about [data-stage-tools]') as HTMLElement
        ).getBoundingClientRect();
        const overlaps = [...document.querySelectorAll('#about [data-node]')].filter((node) => {
          const r = node.getBoundingClientRect();
          return r.left < tools.right && tools.left < r.right && r.top < tools.bottom && tools.top < r.bottom;
        }).length;
        return { width: ring.width, overlaps };
      });
      expect(m.width, mode).toBeGreaterThanOrEqual(200);
      expect(m.overlaps, mode).toBe(0);
    };
    await page.goto(path);
    await expect(page.locator('html')).toHaveClass(/enhanced/);
    await expect(page.locator('#about')).toHaveAttribute('data-unpinned', 'true');
    await measure('flowing');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect(page.locator('html')).not.toHaveClass(/enhanced/);
    await measure('stacked');
  });
}

// The flood (spec 5.0, 5.7): at the end of the page the gold element is the whole screen, solid, square and still.
// Neither the ring growing into it nor the flood itself floats or tilts like the project frame.
for (const path of ['/en', '/ar']) {
  test(`the gold element floods the whole screen and stays still at the end of contact on ${path}`, async ({
    page,
  }) => {
    await page.goto(path);
    await gotoScene(page, 'about', 1);
    await page.evaluate(() => {
      const about = document.getElementById('about') as HTMLElement;
      const viewport = (about.querySelector('[data-sticky]') as HTMLElement).clientHeight;
      window.scrollBy({ top: Number(about.dataset.tail) * viewport * 0.5, behavior: 'instant' });
    });
    await page.waitForTimeout(400);
    expect(await page.locator('[data-gold]').evaluate((el) => el.hasAttribute('data-tilt'))).toBe(false);
    await gotoScene(page, 'contact', 1);
    const m = await page.evaluate(() => {
      const layer = document.querySelector('[data-gold-layer]') as HTMLElement;
      const gold = layer.querySelector('[data-gold]') as HTMLElement;
      const face = gold.querySelector('[data-gold-face]') as HTMLElement;
      const box = gold.getBoundingClientRect();
      const f = face.getBoundingClientRect();
      return {
        visible: getComputedStyle(gold).visibility === 'visible',
        box: [box.left, box.top, box.width, box.height].map(Math.round),
        face: [f.left, f.top, f.width, f.height].map(Math.round),
        screen: [0, 0, layer.clientWidth, layer.clientHeight],
        fill: Number(gold.style.getPropertyValue('--fill')),
        background: getComputedStyle(face).backgroundColor,
        radius: Number.parseFloat(getComputedStyle(gold).borderRadius),
        tilt: gold.hasAttribute('data-tilt'),
        moving: face.getAnimations().length,
      };
    });
    expect(m.visible).toBe(true);
    expect(m.box).toEqual(m.screen);
    expect(m.face).toEqual(m.screen);
    expect(m.fill).toBe(1);
    expect(m.background).toBe('rgb(212, 175, 55)');
    expect(m.radius).toBe(0);
    expect(m.tilt).toBe(false);
    expect(m.moving).toBe(0);
  });
}
