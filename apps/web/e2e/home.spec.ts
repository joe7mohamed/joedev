import AxeBuilder from '@axe-core/playwright';
import { expect, type Page } from '@playwright/test';
import { gotoScene, progressOf, settle, test } from './helpers';

const sections = ['hero', 'work', 'process', 'about', 'contact'];

test('sections exist in reading order with one h1', async ({ page }) => {
  await page.goto('/en');
  const ids = await page.locator('[data-scene]').evaluateAll((els) => els.map((e) => e.id));
  expect(ids).toEqual(sections);
  await expect(page.locator('h1')).toHaveCount(1);
});

test('enhanced mode pins scenes and reports progress', async ({ page }) => {
  await page.goto('/en');
  await expect(page.locator('html')).toHaveClass(/enhanced/);
  await gotoScene(page, 'work', 0.5);
  expect(await progressOf(page, 'work')).toBeCloseTo(0.5, 1);
  expect(await progressOf(page, 'hero')).toBe(1);
  expect(await progressOf(page, 'contact')).toBe(0);
  await expect(page.locator('#work')).toHaveAttribute('data-state', 'active');
  await expect(page.locator('#hero')).toHaveAttribute('data-state', 'after');
});

test('there is no blank screen between scenes', async ({ page }) => {
  await page.goto('/en');
  // the stacked page has no scene states: count only once the engine runs, as gotoScene does
  await page.waitForFunction(() => document.documentElement.classList.contains('enhanced'));
  const total = await page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight);
  for (let y = 0; y <= total; y += Math.round(total / 60)) {
    await page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), y);
    await page.waitForTimeout(60);
    const active = await page.locator('[data-scene][data-state="active"]').count();
    expect(active, `scroll ${y}`).toBe(1);
  }
});

test('a jump lands on readable content', async ({ page }) => {
  await page.goto('/en#process');
  await page.waitForTimeout(900);
  const opacity = await page
    .locator('#process [data-fade]')
    .first()
    .evaluate((el) => Number(getComputedStyle(el).opacity));
  expect(opacity).toBe(1);
});

test('reduced motion gives a stacked page, also when switched on later', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/en');
  await expect(page.locator('html')).not.toHaveClass(/enhanced/);
  const position = await page.locator('#work [data-sticky]').evaluate((el) => getComputedStyle(el).position);
  expect(position).not.toBe('sticky');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(page.locator('html')).toHaveClass(/enhanced/);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('html')).not.toHaveClass(/enhanced/);
  await expect(page.locator('#work')).not.toHaveAttribute('data-state');
  expect(await page.locator('#work').evaluate((el) => el.style.getPropertyValue('--p'))).toBe('');
  const restacked = await page.locator('#work [data-sticky]').evaluate((el) => getComputedStyle(el).position);
  expect(restacked).not.toBe('sticky');
});

test('a scene whose content does not fit is not pinned', async ({ page }) => {
  await page.setViewportSize({ width: 820, height: 360 });
  await page.goto('/ar');
  await page.addStyleTag({ content: 'html{font-size:200%}' });
  await page.evaluate(() => window.dispatchEvent(new Event('resize')));
  await page.waitForTimeout(400);
  for (const id of sections) {
    const clipped = await page
      .locator(`#${id} [data-sticky]`)
      .evaluate((el) => el.scrollHeight - el.clientHeight);
    expect(clipped, id).toBeLessThanOrEqual(1);
  }
});

/** A short landscape screen with doubled text: some scenes no longer fit and must flow. */
const largeText = async (page: Page): Promise<void> => {
  await page.setViewportSize({ width: 820, height: 360 });
  await page.goto('/ar');
  await expect(page.locator('html')).toHaveClass(/enhanced/);
  await page.addStyleTag({ content: 'html{font-size:200%}' });
  await page.evaluate(() => window.dispatchEvent(new Event('resize')));
  await page.waitForTimeout(400);
};

// Under `overflow: clip`, scrollHeight on this centred flex box ignores overflow into the padding area and
// leading-edge overflow, so the test above cannot see content pushed under the header zone or into the bottom
// padding: this one checks that every scene's content sits inside its padding box.
test('large text makes a scene flow instead of overflowing its pinned box', async ({ page }) => {
  await largeText(page);
  for (const id of sections) {
    const overflow = await page.locator(`#${id} [data-sticky]`).evaluate((el) => {
      const style = getComputedStyle(el);
      const kids = [...el.children] as HTMLElement[];
      const top = Math.min(...kids.map((k) => k.offsetTop));
      const bottom = Math.max(...kids.map((k) => k.offsetTop + k.offsetHeight));
      return Math.max(
        Number.parseFloat(style.paddingTop) - top,
        bottom - (el.clientHeight - Number.parseFloat(style.paddingBottom)),
      );
    });
    expect(overflow, id).toBeLessThanOrEqual(1);
  }
  await expect(page.locator('#hero')).toHaveAttribute('data-unpinned', 'true');
  const opacities = await page
    .locator('[data-unpinned] [data-sticky] > [data-fade]')
    .evaluateAll((els) => els.map((el) => Number(getComputedStyle(el).opacity)));
  expect(opacities.length).toBeGreaterThan(0);
  expect(opacities).toEqual(opacities.map(() => 1));
});

test('with scenes that flow, some scene is always active', async ({ page }) => {
  await largeText(page);
  await expect(page.locator('[data-unpinned]')).not.toHaveCount(0);
  const total = await page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight);
  for (let y = 0; y <= total; y += Math.round(total / 60)) {
    await page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), y);
    await page.waitForTimeout(60);
    const active = await page.locator('[data-scene][data-state="active"]').count();
    expect(active, `scroll ${y}`).toBeGreaterThanOrEqual(1);
  }
});

test('keyboard focus inside a scene that flows does not move the page', async ({ page }) => {
  await largeText(page);
  await expect(page.locator('#contact')).toHaveAttribute('data-unpinned', 'true');
  await page.evaluate(() =>
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }),
  );
  await page.waitForTimeout(300);
  const link = page.locator('#contact a[href^="mailto:"]');
  const inView = async (): Promise<void> => {
    const box = await link.boundingBox();
    const height = page.viewportSize()?.height ?? 0;
    expect(box?.y ?? -1).toBeGreaterThanOrEqual(0);
    expect((box?.y ?? 0) + (box?.height ?? Number.POSITIVE_INFINITY)).toBeLessThanOrEqual(height);
  };
  await inView();
  const y = await page.evaluate(() => window.scrollY);
  await link.focus();
  await page.waitForTimeout(900);
  await inView();
  expect(await page.evaluate(() => window.scrollY)).toBe(y);
  await page.keyboard.press('Tab');
  await page.keyboard.press('Shift+Tab');
  await page.waitForTimeout(900);
  await expect(link).toBeFocused();
  await inView();
  expect(await page.evaluate(() => window.scrollY)).toBe(y);
});

test('finished scenes stay in the accessibility tree', async ({ page }) => {
  await page.goto('/en');
  await expect(page.locator('html')).toHaveClass(/enhanced/);
  await gotoScene(page, 'contact', 1);
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
  await expect(page.getByRole('heading', { level: 2 })).toHaveCount(4);
  const visibility = await page
    .locator('#hero [data-sticky]')
    .evaluate((el) => getComputedStyle(el).visibility);
  expect(visibility).toBe('visible');
});

test('a scene whose content has faded out cannot be clicked', async ({ page }) => {
  await page.goto('/en');
  await expect(page.locator('html')).toHaveClass(/enhanced/);
  await gotoScene(page, 'work', 0.5);
  await expect(page.locator('#work')).not.toHaveAttribute('data-faded');
  // 80% into the tail: still the active scene, but its content is gone
  await page.evaluate(() => {
    const el = document.getElementById('work') as HTMLElement;
    const viewport = (el.querySelector('[data-sticky]') as HTMLElement).getBoundingClientRect().height;
    const box = el.getBoundingClientRect();
    const tail = Number(el.dataset.tail) * viewport;
    window.scrollTo({
      top: box.top + window.scrollY + box.height - viewport - tail * 0.2,
      behavior: 'instant',
    });
  });
  await page.waitForTimeout(700);
  await expect(page.locator('#work')).toHaveAttribute('data-state', 'active');
  await expect(page.locator('#work')).toHaveAttribute('data-faded', 'true');
  const events = await page
    .locator('#work [data-sticky]')
    .evaluate((el) => getComputedStyle(el).pointerEvents);
  expect(events).toBe('none');
});

test('a link to the hash already in the address lands on readable content', async ({ page }) => {
  await page.goto('/en#process');
  await page.waitForTimeout(900);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await page.evaluate(() => {
    const link = document.createElement('a');
    link.href = '#process';
    link.id = 'jump';
    link.textContent = 'Process';
    link.style.cssText = 'position:fixed;top:0;left:0;z-index:10;padding:12px;background:#000';
    document.body.append(link);
  });
  await page.locator('#jump').click();
  await page.waitForTimeout(1200);
  await expect(page).toHaveURL(/#process$/);
  const opacity = await page
    .locator('#process [data-fade]')
    .first()
    .evaluate((el) => Number(getComputedStyle(el).opacity));
  expect(opacity).toBe(1);
});

test('the visible scene receives clicks, not the section that follows it', async ({ page }) => {
  await page.goto('/en');
  await expect(page.locator('html')).toHaveClass(/enhanced/);
  for (const [id, fraction] of [
    ['work', 0.97],
    ['process', 0.5],
  ] as const) {
    await gotoScene(page, id, fraction);
    const hit = await page
      .locator(`#${id} [data-fade]`)
      .first()
      .evaluate((el) => {
        const box = el.getBoundingClientRect();
        const target = document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2);
        return target?.closest('[data-scene]')?.id ?? null;
      });
    expect(hit, id).toBe(id);
  }
});

test('content stays on screen next to a scene that flows', async ({ page }) => {
  // The real About content (ring and four cards) no longer fits 820x360 at 200 % text, so spec 6.4 makes it flow
  // there. The scenario is the same as before: a pinned About directly before a flowing Contact, now produced by
  // making Contact taller than any screen instead of relying on About being small.
  await page.goto('/ar');
  await expect(page.locator('html')).toHaveClass(/enhanced/);
  await page.addStyleTag({ content: '#contact [data-sticky] > [data-fade]{min-height:150svh}' });
  await page.evaluate(() => window.dispatchEvent(new Event('resize')));
  await page.waitForTimeout(400);
  await expect(page.locator('#about')).not.toHaveAttribute('data-unpinned');
  await expect(page.locator('#contact')).toHaveAttribute('data-unpinned', 'true');
  const total = await page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight);
  let checked = 0;
  for (let y = 0; y <= total; y += Math.round(total / 60)) {
    await page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), y);
    await page.waitForTimeout(60);
    // null during a crossfade between two pinned scenes, where both may legitimately be near 0
    const readable = await page.evaluate(() => {
      const scenes = [...document.querySelectorAll<HTMLElement>('[data-scene]')];
      const pinned = (el?: HTMLElement): boolean => Boolean(el) && !el?.hasAttribute('data-unpinned');
      const crossfade = scenes.some((scene, i) => {
        if (scene.dataset.state !== 'active' || !pinned(scene)) return false;
        const style = getComputedStyle(scene);
        const leaving = Number(style.getPropertyValue('--out')) > 0 && pinned(scenes[i + 1]);
        const entering = Number(style.getPropertyValue('--p')) < 0.04 && pinned(scenes[i - 1]);
        return leaving || entering;
      });
      if (crossfade) return null;
      return [...document.querySelectorAll('[data-fade]')].some((el) => {
        const box = el.getBoundingClientRect();
        const onScreen = box.bottom > 0 && box.top < window.innerHeight;
        return onScreen && Number(getComputedStyle(el).opacity) >= 0.99;
      });
    });
    if (readable === null) continue;
    checked += 1;
    expect(readable, `scroll ${y}`).toBe(true);
  }
  expect(checked).toBeGreaterThan(0);
});

test('without JavaScript every section is readable', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('/ar');
  for (const id of sections) await expect(page.locator(`#${id}`)).toBeVisible();
  await expect(page.getByRole('link', { name: 'youssef@zakydev.com' })).toBeVisible();
});

test('without JavaScript every project and every process step is shown', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('/en');
  for (const name of ['Nuammer', 'Wazifi', 'Talmeeha'])
    await expect(page.locator('#work').getByRole('heading', { name })).toBeVisible();
  for (const name of ['Understand', 'Design', 'Build', 'Test', 'Launch'])
    await expect(page.locator('#process').getByRole('heading', { name })).toBeVisible();
});

test('menu marks the section in view and links scroll to it', async ({ page }) => {
  await page.goto('/en');
  const nav = page.getByRole('navigation', { name: 'Sections' });
  await expect(nav.locator('[aria-current="true"]')).toHaveCount(0);
  await gotoScene(page, 'process', 0.5);
  await expect(nav.locator('[aria-current="true"]')).toHaveText(/Process/);
  await nav.getByRole('link', { name: 'About' }).click();
  await expect.poll(() => page.locator('#about').getAttribute('data-state')).toBe('active');
  await expect(nav.locator('[aria-current="true"]')).toHaveText(/About/);
});

test('menu is fully usable from the keyboard', async ({ page }) => {
  await page.goto('/en');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
  for (const name of ['ZakyDev', 'Work', 'Process', 'About', 'Contact']) {
    await page.keyboard.press('Tab');
    await expect(page.getByRole('link', { name, exact: false }).first()).toBeFocused();
  }
});

test('phone menu sits at the bottom with large targets', async ({ page }, info) => {
  test.skip(info.project.name !== 'phone');
  await page.goto('/ar');
  const nav = page.getByRole('navigation');
  const box = await nav.boundingBox();
  const height = page.viewportSize()?.height ?? 0;
  expect((box?.y ?? 0) + (box?.height ?? 0)).toBeGreaterThan(height - 40);
  for (const link of await nav.getByRole('link').all())
    expect((await link.boundingBox())?.height).toBeGreaterThanOrEqual(44);
});

test('desktop menu targets are at least 44 px tall', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop');
  await page.goto('/en');
  const links = page.getByRole('navigation').getByRole('link');
  await expect(links).toHaveCount(4);
  for (const link of await links.all()) expect((await link.boundingBox())?.height).toBeGreaterThanOrEqual(44);
});

test('the current menu item is the section under the middle of the screen', async ({ page }) => {
  await page.setViewportSize({ width: 820, height: 360 });
  await page.goto('/ar');
  await expect(page.locator('html')).toHaveClass(/enhanced/);
  // text so large that neighbouring scenes flow, so two of them can be active at once
  await page.addStyleTag({ content: 'html{font-size:300%}' });
  await page.evaluate(() => window.dispatchEvent(new Event('resize')));
  await page.waitForTimeout(400);
  for (const id of ['hero', 'work', 'about', 'contact'])
    await expect(page.locator(`#${id}`)).toHaveAttribute('data-unpinned', 'true');
  /** Scrolls so the section's top sits at this fraction of the viewport height. */
  const placeTop = async (id: string, fraction: number): Promise<void> => {
    await page.evaluate(
      ([sceneId, f]) => {
        const el = document.getElementById(sceneId as string) as HTMLElement;
        const top = el.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({ top: top - window.innerHeight * (f as number), behavior: 'instant' });
      },
      [id, fraction] as const,
    );
    await page.waitForTimeout(300);
  };
  const current = page.getByRole('navigation').locator('[aria-current="true"]');
  const bothActive = async (a: string, b: string): Promise<void> => {
    await expect(page.locator(`#${a}`)).toHaveAttribute('data-state', 'active');
    await expect(page.locator(`#${b}`)).toHaveAttribute('data-state', 'active');
  };
  // contact's top is above the middle while the end of about is still on screen
  await placeTop('contact', 0.3);
  await bothActive('about', 'contact');
  await expect(current).toHaveAttribute('href', '#contact');
  // about still covers the middle
  await placeTop('contact', 0.7);
  await bothActive('about', 'contact');
  await expect(current).toHaveAttribute('href', '#about');
  // the hero covers the middle: no item is current, even though work has started
  await placeTop('work', 0.7);
  await bothActive('hero', 'work');
  await expect(current).toHaveCount(0);
});

test('on the stacked page the fixed header does not cover the headline', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/en');
  await expect(page.locator('html')).not.toHaveClass(/enhanced/);
  const header = await page.locator('header').boundingBox();
  const h1 = await page.locator('h1').boundingBox();
  expect(h1?.y ?? 0).toBeGreaterThanOrEqual((header?.y ?? 0) + (header?.height ?? Number.POSITIVE_INFINITY));
});

// Spec 6.4 layers: background, gold element, scene content, header, loader.
test('the header sits above the gold element', async ({ page }) => {
  await page.goto('/en');
  await gotoScene(page, 'work', 0.5);
  await expect(page.locator('header')).toHaveCSS('z-index', '5');
  // the gold frame is stretched over the whole screen and made hit-testable, so only stacking decides the order
  await page.addStyleTag({
    content:
      'html.enhanced [data-gold-layer],html.enhanced [data-gold]{pointer-events:auto}' +
      'html.enhanced [data-gold]{transform:none!important;width:100vw!important;height:100vh!important;visibility:visible!important}',
  });
  const links = page.getByRole('navigation').getByRole('link');
  await expect(links).toHaveCount(4);
  for (const link of await links.all()) {
    const hit = await link.evaluate((el) => {
      const box = el.getBoundingClientRect();
      const stack = document.elementsFromPoint(box.left + box.width / 2, box.top + box.height / 2);
      return {
        top: stack[0]?.closest('a') === el && Boolean(stack[0]?.closest('header')),
        goldBelow: stack.some((node) => node.matches('[data-gold]')),
      };
    });
    expect(hit).toEqual({ top: true, goldBelow: true });
  }
});

test('the page never scrolls sideways', async ({ page }) => {
  for (const path of ['/en', '/ar']) {
    await page.goto(path);
    for (const id of sections) {
      await gotoScene(page, id, 0.5);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow).toBeLessThanOrEqual(0);
    }
  }
});

test('hero shows title, place, availability, headline, sentence and both actions', async ({ page }) => {
  await page.goto('/en');
  const hero = page.locator('#hero');
  await expect(hero.getByRole('heading', { level: 1 })).toHaveAccessibleName(
    'I build software that holds up under pressure.',
  );
  await expect(hero.getByText('Bahrain')).toBeVisible();
  await expect(hero.getByText('Available for new projects')).toBeVisible();
  await expect(hero.getByRole('link', { name: 'See my work' })).toHaveAttribute('href', '#work');
  await expect(hero.getByRole('link', { name: 'Start a project' })).toHaveAttribute('href', '#contact');
});

test('typed title alternates between the two titles', async ({ page }) => {
  await page.goto('/en');
  const title = page.locator('[data-typed]');
  await expect(title).toHaveText('Software engineer', { timeout: 6000 });
  await expect(title).toHaveText('Full-stack developer', { timeout: 12000 });
});

test('Arabic headline is never split into letters', async ({ page }) => {
  await page.goto('/ar');
  await expect(page.locator('#hero h1 [data-ch]')).toHaveCount(0);
  await expect(page.locator('#hero h1')).toHaveAccessibleName('أبني برمجيات تصمد تحت الضغط.');
});

test('headline zooms into the key word and is gone by the end of the scene', async ({ page }) => {
  await page.goto('/en');
  const scaleAt = async (f: number) => {
    await gotoScene(page, 'hero', f);
    return page.locator('#hero h1').evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).a);
  };
  expect(await scaleAt(0)).toBeCloseTo(1, 1);
  expect(await scaleAt(1)).toBeGreaterThan(2);
});

// Spec 5.0: from S 0 to 0.5 the gold element is the underline of the zoom word, never the work frame.
for (const path of ['/en', '/ar']) {
  test(`at the top of the hero the gold element is the underline of the zoom word on ${path}`, async ({
    page,
  }) => {
    await page.goto(path);
    await gotoScene(page, 'hero', 0);
    // the Arabic display face is not preloaded; a late swap changes the word's width for one frame
    await page.evaluate(() => document.fonts.ready.then(() => undefined));
    const measure = () =>
      page.evaluate(() => {
        const g = (document.querySelector('[data-gold]') as HTMLElement).getBoundingClientRect();
        const k = (document.querySelector('#hero [data-key]') as HTMLElement).getBoundingClientRect();
        return {
          g: { x: g.left, y: g.top, w: g.width, h: g.height },
          k: { x: k.left, y: k.top, w: k.width, h: k.height },
        };
      });
    // the line is drawn in after the headline builds; wait until it is fully drawn (in RTL it grows from the
    // right, so an unfinished draw also shows as an offset start edge)
    await expect
      .poll(
        async () => {
          const { g, k } = await measure();
          return Math.max(Math.abs(g.w - k.w), Math.abs(g.x - k.x));
        },
        { timeout: 5000 },
      )
      .toBeLessThanOrEqual(1);
    const { g, k } = await measure();
    expect(g.h).toBeLessThan(12);
    expect(Math.abs(g.x - k.x)).toBeLessThanOrEqual(1);
    // it sits on the word's baseline: in the lowest part of the word's box, not below it
    expect(g.y).toBeGreaterThanOrEqual(k.y + k.h * 0.75);
    expect(g.y + g.h).toBeLessThanOrEqual(k.y + k.h + 2);
  });
}

test('with reduced motion the hero is fully visible and still', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const path of ['/en', '/ar']) {
    await page.goto(path);
    await expect(page.locator('html')).not.toHaveClass(/enhanced/);
    await page.waitForTimeout(1500);
    const opacities = await page
      .locator('#hero [data-ch], #hero [data-word]')
      .evaluateAll((els) => els.map((el) => Number(getComputedStyle(el).opacity)));
    expect(opacities.length).toBeGreaterThan(0);
    expect(opacities).toEqual(opacities.map(() => 1));
    const first = path === '/en' ? 'Software engineer' : 'مهندس برمجيات';
    await expect(page.locator('[data-typed]')).toHaveText(first);
    const transform = await page.locator('#hero h1').evaluate((el) => getComputedStyle(el).transform);
    expect(transform).toBe('none');
  }
});

type Samples = { at: string; values: number[] }[];
type Restarts = { oneShot: number; restarted: string[] };
const ONE_SHOT = ['hero-letter', 'hero-word', 'hero-weight', 'hero-in', 'hero-bracket', 'hero-type'];

// The server paints the hero; the build must already be running then, so the app taking over (html.enhanced)
// never sends a visible letter back to transparent, and never restarts any one-shot hero animation.
for (const path of ['/en', '/ar']) {
  test(`the headline builds from first paint and never restarts on ${path}`, async ({ page }) => {
    await page.addInitScript((names: string[]) => {
      const samples: Samples = [];
      const result: Restarts = { oneShot: 0, restarted: [] };
      const w = window as unknown as { heroSamples: Samples; heroRestarts: Restarts };
      w.heroSamples = samples;
      w.heroRestarts = result;
      const oneShot = (): CSSAnimation[] =>
        (document.getElementById('hero')?.getAnimations({ subtree: true }) ?? []).filter(
          (a): a is CSSAnimation => a instanceof CSSAnimation && names.includes(a.animationName),
        );
      let first = new Map<CSSAnimation, number | null>();
      const sample = (at: string): void => {
        const els = [...document.querySelectorAll('#hero [data-ch], #hero [data-word]')];
        samples.push({ at, values: els.map((el) => Number(getComputedStyle(el).opacity)) });
        const running = oneShot();
        if (at === 'paint') {
          first = new Map(running.map((a) => [a, a.startTime === null ? null : Number(a.startTime)]));
          result.oneShot = first.size;
          return;
        }
        // a restarted CSS animation is a new object, or the same one with a new start time
        for (const a of running) {
          const known = first.has(a);
          const was = first.get(a);
          const moved = known && was !== null && was !== undefined && Number(a.startTime) !== was;
          if (!known || moved) result.restarted.push(`${a.animationName} ${known ? 'restarted' : 'new'}`);
        }
      };
      let painted = false;
      let enhanced = false;
      new MutationObserver(() => {
        if (!painted && document.querySelector('#hero [data-foot]')) {
          painted = true;
          requestAnimationFrame(() => sample('paint'));
        }
        if (!enhanced && document.documentElement?.classList.contains('enhanced')) {
          enhanced = true;
          sample('enhanced');
        }
      }).observe(document, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
    }, ONE_SHOT);
    await page.goto(path);
    await expect(page.locator('html')).toHaveClass(/enhanced/);
    await expect
      .poll(() => page.evaluate(() => (window as unknown as { heroSamples: Samples }).heroSamples.length))
      .toBe(2);
    const samples = await page.evaluate(() => (window as unknown as { heroSamples: Samples }).heroSamples);
    expect(samples.map((s) => s.at)).toEqual(['paint', 'enhanced']);
    const [before, after] = samples.map((s) => s.values) as [number[], number[]];
    expect(before.length).toBeGreaterThan(0);
    expect(after).toHaveLength(before.length);
    before.forEach((a, i) => {
      const b = after[i] ?? 0;
      expect(a >= 0.99 && b < 0.5, `element ${i}: ${a} -> ${b}`).toBe(false);
      expect(b, `element ${i} went back`).toBeGreaterThanOrEqual(a - 0.05);
    });
    const restarts = await page.evaluate(
      () => (window as unknown as { heroRestarts: Restarts }).heroRestarts,
    );
    expect(restarts.oneShot, 'one-shot animations running at first paint').toBeGreaterThan(0);
    expect(restarts.restarted).toEqual([]);
  });
}

// Spec 5.3: the first title types in. It is server-rendered whole and revealed by a stepped clip from first paint.
for (const path of ['/en', '/ar']) {
  test(`the first title types in from first paint on ${path}`, async ({ page }) => {
    await page.addInitScript(() => {
      const w = window as unknown as { typedClip: string | null };
      w.typedClip = null;
      // the reveal starts 1.05 s after navigation start; sample 0.3 s into it
      setTimeout(() => {
        const el = document.querySelector('[data-typed]');
        w.typedClip = el ? getComputedStyle(el).clipPath : 'missing';
      }, 1350 - performance.now());
    });
    await page.goto(path);
    await expect
      .poll(() => page.evaluate(() => (window as unknown as { typedClip: string | null }).typedClip))
      .not.toBeNull();
    const mid = await page.evaluate(() => (window as unknown as { typedClip: string }).typedClip);
    expect(mid).toMatch(/^inset\(/);
    expect(mid).not.toBe('inset(0px)');
    await page.waitForFunction(() => performance.now() >= 4000);
    const end = await page.locator('[data-typed]').evaluate((el) => getComputedStyle(el).clipPath);
    expect(['none', 'inset(0px)']).toContain(end);
  });
}

// Spec 8: nothing is clipped at any test width; the step strip is decoration, not a target, so it may shrink.
for (const path of ['/en', '/ar']) {
  test(`the step strip fits a 360 px phone on ${path}`, async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 780 });
    await page.goto(path);
    await page.evaluate(() => document.fonts.ready.then(() => undefined));
    const strip = await page.locator('#hero [data-steps]').evaluate((el) => {
      const box = el.getBoundingClientRect();
      const column = (el.closest('[data-hero]') as HTMLElement).getBoundingClientRect();
      return {
        scroll: el.scrollWidth,
        client: el.clientWidth,
        left: box.left,
        right: box.right,
        vw: innerWidth,
        columnLeft: column.left,
        columnRight: column.right,
      };
    });
    expect(strip.scroll).toBeLessThanOrEqual(strip.client);
    expect(strip.left).toBeGreaterThanOrEqual(0);
    expect(strip.right).toBeLessThanOrEqual(strip.vw);
    // and inside the hero column, not in its side padding
    expect(strip.left).toBeGreaterThanOrEqual(strip.columnLeft - 0.5);
    expect(strip.right).toBeLessThanOrEqual(strip.columnRight + 0.5);
  });
}

// In Chromium the 17 px sentence fits one line at 360 px with every word; one pixel more (wider fallback or
// platform metrics) makes some words wrap and others not, so that variant proves the width is reserved.
for (const path of ['/en', '/ar'])
  for (const wider of [false, true]) {
    test(`the rotating word never moves the hero on a narrow phone on ${path}${wider ? ' with wider text' : ''}`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: 360, height: 780 });
      await page.goto(path);
      await expect(page.locator('html')).toHaveClass(/enhanced/);
      if (wider) await page.addStyleTag({ content: '#hero [data-lead]{font-size:18px}' });
      await page.evaluate(() => document.fonts.ready.then(() => undefined));
      await page.waitForTimeout(300);
      const read = () =>
        page.evaluate(() => ({
          lead: (document.querySelector('#hero [data-lead]') as HTMLElement).getBoundingClientRect().height,
          top: (document.querySelector('#hero h1') as HTMLElement).getBoundingClientRect().top,
        }));
      const first = await read();
      // two rotations (2.4 s each), sampled through the flips
      for (let i = 0; i < 18; i += 1) {
        await page.waitForTimeout(300);
        const now = await read();
        expect(Math.abs(now.lead - first.lead), `sentence height at ${i}`).toBeLessThanOrEqual(0.5);
        expect(Math.abs(now.top - first.top), `headline top at ${i}`).toBeLessThanOrEqual(0.5);
      }
    });
  }

test('at the end of the hero only the zoom word is left, fully scaled, and the headline is gone', async ({
  page,
}) => {
  await page.goto('/en');
  await expect(page.locator('html')).toHaveClass(/enhanced/);
  await page.evaluate(() => {
    const el = document.getElementById('hero') as HTMLElement;
    const sticky = el.querySelector('[data-sticky]') as HTMLElement;
    window.scrollTo({ top: el.offsetHeight - sticky.clientHeight, behavior: 'instant' });
  });
  await page.waitForTimeout(700);
  const state = await page.locator('#hero h1').evaluate((h1) => ({
    others: [...h1.querySelectorAll('[data-word]:not([data-key]) > [data-ink]')].map((el) =>
      Number(getComputedStyle(el).opacity),
    ),
    scale: new DOMMatrix(getComputedStyle(h1).transform).a,
    shown: Number(getComputedStyle(h1).opacity),
  }));
  expect(state.others.length).toBeGreaterThan(0);
  expect(state.others).toEqual(state.others.map(() => 0));
  expect(state.scale).toBeCloseTo(16, 1);
  expect(state.shown).toBeLessThan(0.01);
});

test('the English build never moves a letter', async ({ page }) => {
  await page.goto('/en');
  const positions = () =>
    page
      .locator('#hero [data-ch]')
      .evaluateAll((els) =>
        (els as HTMLElement[]).map((el) => (el.offsetParent as HTMLElement).offsetLeft + el.offsetLeft),
      );
  await page.waitForFunction(() => performance.now() >= 200);
  const early = await positions();
  await page.waitForFunction(() => performance.now() >= 2000);
  const settled = await positions();
  expect(early.length).toBeGreaterThan(0);
  expect(settled).toEqual(early);
});

test('work shows each project with a real screenshot and a safe external link', async ({ page }) => {
  await page.goto('/en');
  const expected = [
    ['Nuammer', 'https://nuammer.com'],
    ['Wazifi', 'https://wazifi.vercel.app'],
    ['Talmeeha', 'https://talmeeha.vercel.app'],
  ] as const;
  for (let i = 0; i < 3; i++) {
    await gotoScene(page, 'work', (i + 0.5) / 3);
    const [name, url] = expected[i] as (typeof expected)[number];
    await expect(page.locator('#work [data-current] h3')).toHaveText(name);
    const link = page.locator('#work [data-current]').getByRole('link', { name: /Visit live site/ });
    await expect(link).toHaveAttribute('href', url);
    await expect(link).toHaveAttribute('rel', /noopener/);
    await expect(link).toHaveAttribute('target', '_blank');
  }
});

test('project bars are buttons that jump to a project', async ({ page }) => {
  await page.goto('/en');
  await gotoScene(page, 'work', 0.1);
  await page.locator('#work').getByRole('button', { name: 'Talmeeha' }).click();
  await expect(page.locator('#work [data-current] h3')).toHaveText('Talmeeha');
});

// Controller ruling: the hero zoom and the work frame share one optimised URL for the first screenshot.
test('the first screenshot is downloaded once for the hero zoom and the work frame', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', (request) => {
    if (request.url().includes('nuammer')) requests.push(request.url());
  });
  await page.goto('/en');
  await gotoScene(page, 'hero', 0.6);
  await gotoScene(page, 'work', 0.17);
  const shot = page.locator('#gold-content img').first();
  await expect
    .poll(() =>
      shot.evaluate((img) => (img as HTMLImageElement).complete && (img as HTMLImageElement).naturalWidth),
    )
    .toBeGreaterThan(0);
  await page.waitForLoadState('networkidle');
  expect(requests, requests.join('\n')).toHaveLength(1);
});

test('the other screenshots wait until the hero hands over to work', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', (request) => {
    if (/wazifi|talmeeha/.test(request.url())) requests.push(request.url());
  });
  await page.goto('/en');
  await gotoScene(page, 'hero', 0.2);
  await page.waitForLoadState('networkidle');
  expect(requests, requests.join('\n')).toHaveLength(0);
  await gotoScene(page, 'work', 0.5);
  await expect.poll(() => requests.length).toBeGreaterThan(0);
});

// Spec 3.3: Arabic is never letter-spaced, while Latin runs on the Arabic page (lang="en") keep their tracking.
test('Latin project names keep their tracking on the Arabic page, Arabic text has none', async ({ page }) => {
  const spacing = async (path: string) => {
    await page.goto(path);
    await gotoScene(page, 'work', 0.17);
    return page.evaluate(() => ({
      name: getComputedStyle(document.querySelector('#work [data-current] h3') as HTMLElement).letterSpacing,
      headline: getComputedStyle(document.querySelector('#hero h1') as HTMLElement).letterSpacing,
    }));
  };
  const en = await spacing('/en');
  const ar = await spacing('/ar');
  expect(en.name).not.toBe('normal');
  expect(ar.name).toBe(en.name);
  expect(['normal', '0px']).toContain(ar.headline);
});

test('process walks through five steps with what the client gets', async ({ page }) => {
  await page.goto('/en');
  const names = ['Understand', 'Design', 'Build', 'Test', 'Launch'];
  const gives = [
    'A clear plan',
    'Screens you can click through',
    'A working version, early',
    'Fewer surprises',
    'A live product, looked after',
  ];
  for (let i = 0; i < 5; i++) {
    await gotoScene(page, 'process', (i + 0.5) / 5);
    await expect(page.locator('#process [data-step-name]')).toHaveText(names[i] as string);
    await expect(page.locator('#process [data-gives]')).toContainText(gives[i] as string);
  }
});

test('process stations are buttons and the drawing is finished at the end', async ({ page }) => {
  await page.goto('/en');
  await gotoScene(page, 'process', 0.05);
  await page
    .locator('#process')
    .getByRole('button', { name: /Launch/ })
    .click();
  await expect(page.locator('#process [data-step-name]')).toHaveText('Launch');
  await gotoScene(page, 'process', 1);
  await page.waitForTimeout(300);
  const p4 = await page
    .locator('#process svg')
    .first()
    .evaluate((el) => Number(getComputedStyle(el).getPropertyValue('--p4')));
  expect(p4).toBe(1);
});

test('about shows the loop, four facts and the Riot disclaimer', async ({ page }) => {
  await page.goto('/en');
  await gotoScene(page, 'about', 0.5);
  const about = page.locator('#about');
  await expect(about.getByRole('heading', { level: 2 })).toHaveText('One engineer, from A to Z.');
  await expect(about.locator('[data-station]')).toHaveCount(7);
  await expect(about.locator('[data-fact]')).toHaveCount(4);
  await expect(about.getByText("ZakyDev isn't endorsed by Riot Games.")).toBeVisible();
  await expect(about.locator('[data-stage-name]')).not.toHaveText('');
});

// Spec 5.10: the stacked page shows the ring with every station resting on the first stage, and finished cards.
test('with reduced motion the about loop rests on the first stage', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/ar');
  const about = page.locator('#about');
  await expect(about.locator('[data-station]')).toHaveCount(7);
  await expect(about.locator('[data-station][data-current="true"]')).toHaveAttribute('data-index', '0');
  await expect(about.locator('[data-stage-name]')).toHaveText('الفكرة');
  await expect(about.locator('[data-stage-tools]')).toHaveText('Brief · user flow');
  await expect(about.locator('[data-fact]')).toHaveCount(4);
  const running = await about.evaluate((el) => el.getAnimations({ subtree: true }).length);
  expect(running).toBe(0);
});

// Latin runs on the Arabic page (tool names, drawing labels) are marked as English (Task 7 ruling).
test('Latin text in the about scene is marked as English on the Arabic page', async ({ page }) => {
  await page.goto('/ar');
  await gotoScene(page, 'about', 0.5);
  await expect(page.locator('#about [data-stage-tools]')).toHaveAttribute('lang', 'en');
  const scenes = page.locator('#about [data-fact] svg');
  await expect(scenes).toHaveCount(4);
  for (const svg of await scenes.all()) {
    await expect(svg).toHaveAttribute('lang', 'en');
    await expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(await svg.evaluate((el) => getComputedStyle(el).direction)).toBe('ltr');
  }
});

test('contact always exposes the real email and both profiles', async ({ page }) => {
  await page.goto('/en');
  await gotoScene(page, 'contact', 1);
  const contact = page.locator('#contact');
  await expect(contact.getByRole('heading', { level: 2 })).toHaveText('What needs building?');
  await expect(contact.getByRole('link', { name: 'youssef@zakydev.com' })).toHaveAttribute(
    'href',
    'mailto:youssef@zakydev.com',
  );
  await expect(contact.getByRole('link', { name: 'GitHub' })).toHaveAttribute(
    'href',
    'https://github.com/joe7mohamed',
  );
  await expect(contact.getByRole('link', { name: 'LinkedIn' })).toHaveAttribute(
    'href',
    'https://linkedin.com/in/youssef7mohamed',
  );
});

test('copy email confirms on success', async ({ page, context }, info) => {
  test.skip(info.project.name !== 'desktop');
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/en');
  await gotoScene(page, 'contact', 1);
  await page.getByRole('button', { name: 'Copy email' }).click();
  await expect(page.getByRole('button', { name: 'Copied' })).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('youssef@zakydev.com');
});

test('copy email selects the address when the clipboard is refused', async ({ page }) => {
  await page.goto('/en');
  await page.evaluate(() => {
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: () => Promise.reject(new Error('denied')) },
      configurable: true,
    });
  });
  await gotoScene(page, 'contact', 1);
  await page.getByRole('button', { name: 'Copy email' }).click();
  await expect(page.getByRole('button', { name: 'Copy email' })).toBeVisible();
  expect(await page.evaluate(() => String(getSelection()))).toBe('youssef@zakydev.com');
});

test('menu switches to dark ink on the gold screen', async ({ page }) => {
  await page.goto('/en');
  await gotoScene(page, 'contact', 1);
  await expect(page.locator('header')).toHaveAttribute('data-on-gold', 'true');
  await gotoScene(page, 'about', 0.5);
  await expect(page.locator('header')).not.toHaveAttribute('data-on-gold', 'true');
});

// Ruling 3: success is announced politely; the fallback (selection) announces nothing and never claims "Copied".
test('copy email tells assistive technology only when it really copied', async ({ page, context }, info) => {
  test.skip(info.project.name !== 'desktop');
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/en');
  await gotoScene(page, 'contact', 1);
  const live = page.locator('#contact [aria-live="polite"]');
  await expect(live).toHaveCount(1);
  await expect(live).toHaveText('');
  await page.getByRole('button', { name: 'Copy email' }).click();
  await expect(live).toHaveText('Copied');
  // the label returns after 1.6 s
  await expect(page.getByRole('button', { name: 'Copy email' })).toBeVisible({ timeout: 4000 });
});

for (const refusal of ['rejected', 'missing']) {
  test(`copy email announces nothing when the clipboard is ${refusal}`, async ({ page }) => {
    await page.goto('/en');
    await page.evaluate((how) => {
      const value = how === 'missing' ? undefined : { writeText: () => Promise.reject(new Error('denied')) };
      Object.defineProperty(navigator, 'clipboard', { value, configurable: true });
    }, refusal);
    await gotoScene(page, 'contact', 1);
    await page.getByRole('button', { name: 'Copy email' }).click();
    await page.waitForTimeout(300);
    expect(await page.evaluate(() => String(getSelection()))).toBe('youssef@zakydev.com');
    await expect(page.locator('#contact [aria-live="polite"]')).toHaveText('');
    await expect(page.getByRole('button', { name: 'Copied' })).toHaveCount(0);
  });
}

test('profile links open in a new tab as rel="me" and their icons are decorative', async ({ page }) => {
  await page.goto('/ar');
  await gotoScene(page, 'contact', 1);
  for (const name of ['GitHub', 'LinkedIn']) {
    const link = page.locator('#contact').getByRole('link', { name });
    await expect(link).toHaveAttribute('target', '_blank');
    await expect(link).toHaveAttribute('rel', 'noopener me');
    await expect(link).toHaveAttribute('lang', 'en');
    await expect(link.locator('[aria-hidden="true"]')).toHaveCount(1);
  }
  await expect(page.locator('#contact a[href^="mailto:"]')).toHaveAttribute('lang', 'en');
  await expect(page.getByRole('contentinfo')).toHaveText('ZakyDev · Youssef Zaky · Bahrain');
  await expect(page.locator('#contact [data-contact-meta] li')).toHaveCount(3);
  await expect(page.locator('#contact [data-contact-meta] svg[aria-hidden="true"]')).toHaveCount(3);
});

// Spec 3.3: Arabic rises by word, never by letter; the heading still reads as one sentence.
test('the Arabic contact heading rises by word and is never split into letters', async ({ page }) => {
  await page.goto('/ar');
  await gotoScene(page, 'contact', 1);
  const heading = page.locator('#contact h2');
  await expect(heading).toHaveText('ما الذي تريد بناءه؟');
  const words = await heading.locator('[data-word]').allTextContents();
  expect(words).toEqual(['ما', 'الذي', 'تريد', 'بناءه؟']);
});

// The email is real text inside the link at every moment of the typing reveal; only a clip hides part of it.
test('the email types itself in over the real address, then rests fully shown', async ({ page }) => {
  await page.goto('/en');
  await gotoScene(page, 'contact', 0.02);
  const email = page.locator('#contact a[href^="mailto:"]');
  await expect(email).toHaveText('youssef@zakydev.com');
  await expect(page.locator('#contact [data-contact]')).toHaveAttribute('data-play', 'true');
  const timing = await email.evaluate((el) => getComputedStyle(el).animationTimingFunction);
  expect(timing).toMatch(/^steps\(/);
  await expect
    .poll(() => email.evaluate((el) => getComputedStyle(el).clipPath), { timeout: 5000 })
    .toMatch(/^(none|inset\(0(px)?\))$/);
  await expect(email).toHaveText('youssef@zakydev.com');
});

// Ruling 5 / spec 5.10: stacked, the section is its own solid gold screen with every part shown.
test('with reduced motion the contact section is solid gold and fully shown', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/en');
  const contact = page.locator('#contact');
  expect(await contact.evaluate((el) => getComputedStyle(el).backgroundColor)).toBe('rgb(212, 175, 55)');
  expect(await contact.evaluate((el) => getComputedStyle(el).color)).toBe('rgb(20, 18, 14)');
  await contact.scrollIntoViewIfNeeded();
  for (const part of ['h2', 'a[href^="mailto:"]', 'button', '[data-contact-meta]']) {
    await expect(contact.locator(part).first(), part).toBeVisible();
  }
  // the footer is the page's own, right after <main> (fix round 1)
  await expect(page.getByRole('contentinfo')).toBeVisible();
  const running = await contact.evaluate((el) => el.getAnimations({ subtree: true }).length);
  expect(running).toBe(0);
});

// Ruling 6: every text on the gold screen meets AA in both themes.
for (const scheme of ['dark', 'light'] as const) {
  test(`no accessibility violations on the gold contact screen (${scheme})`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: scheme });
    await page.goto('/en');
    await expect(page.locator('html')).toHaveAttribute('data-theme', scheme);
    await gotoScene(page, 'contact', 1);
    await settle(page);
    const results = await new AxeBuilder({ page }).include('#contact').analyze();
    expect(results.violations).toEqual([]);
  });
}

// Fix round 1, spec 7: the footer is the page-level contentinfo landmark, after <main>, in every mode.
const footerText = 'ZakyDev · Youssef Zaky · Bahrain';
const toBottom = (page: Page) =>
  page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }));
for (const path of ['/en', '/ar']) {
  test(`the footer is the page's contentinfo landmark on ${path}, enhanced and stacked`, async ({ page }) => {
    await page.goto(path);
    await gotoScene(page, 'contact', 1);
    const footer = page.getByRole('contentinfo');
    await expect(footer).toBeVisible();
    await expect(footer).toHaveText(footerText);
    await expect(footer).toHaveCSS('opacity', '1');
    await expect(page.locator('main footer')).toHaveCount(0);
    await expect(page.locator('main + footer')).toHaveCount(1);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect(page.locator('html')).not.toHaveClass(/enhanced/);
    await toBottom(page);
    await expect(footer).toBeVisible();
    await expect(footer).toHaveText(footerText);
    // in normal flow (relative only lifts it above the background layers)
    expect(await footer.evaluate((el) => getComputedStyle(el).position)).toMatch(/^(static|relative)$/);
    expect(await footer.evaluate((el) => getComputedStyle(el).backgroundColor)).toBe('rgb(212, 175, 55)');
  });

  test(`the footer is the page's contentinfo landmark on ${path} without JavaScript`, async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto(path);
    await toBottom(page);
    const footer = page.getByRole('contentinfo');
    await expect(footer).toBeVisible();
    await expect(footer).toHaveText(footerText);
    // the gold screen's muted ink on its gold surface
    expect(await footer.evaluate((el) => getComputedStyle(el).color)).toBe('rgb(74, 64, 38)');
    expect(await footer.evaluate((el) => getComputedStyle(el).backgroundColor)).toBe('rgb(212, 175, 55)');
    await context.close();
  });
}

// The engine's LAST rule: nothing may add scroll height below #contact while it is pinned, or it would stop being
// active at the very bottom (and the header would leave the gold).
test('the fixed footer adds no scroll height and shows only on the contact scene', async ({ page }) => {
  await page.goto('/en');
  await gotoScene(page, 'about', 0.5);
  const footer = page.getByRole('contentinfo');
  await expect(footer).toHaveCSS('opacity', '0');
  await toBottom(page);
  await page.waitForTimeout(500);
  await expect(page.locator('#contact')).toHaveAttribute('data-state', 'active');
  await expect(page.locator('#contact')).not.toHaveAttribute('data-unpinned', 'true');
  const m = await page.evaluate(() => {
    const contact = (document.getElementById('contact') as HTMLElement).getBoundingClientRect();
    return { height: document.documentElement.scrollHeight, bottom: contact.bottom + window.scrollY };
  });
  expect(Math.abs(m.height - m.bottom)).toBeLessThanOrEqual(1);
  await expect(footer).toHaveCSS('opacity', '1');
  expect(await footer.evaluate((el) => getComputedStyle(el).position)).toBe('fixed');
});

// Spec 7: the phone footer and the space kept for it include the home-indicator inset. Playwright reports an inset of
// 0, so the test sets the one custom property every bottom offset reads in place of env().
test('the phone footer clears the bottom bar with a home-indicator inset', async ({ page }, info) => {
  test.skip(info.project.name !== 'phone');
  await page.goto('/en');
  await page.addStyleTag({ content: ':root{--safe-bottom:34px}' });
  await gotoScene(page, 'contact', 1);
  const m = await page.evaluate(() => {
    const footer = (document.querySelector('body > footer') as HTMLElement).getBoundingClientRect();
    const bar = (document.querySelector('[data-menu]') as HTMLElement).getBoundingClientRect();
    const meta = (
      document.querySelector('#contact [data-contact-meta]') as HTMLElement
    ).getBoundingClientRect();
    return { footer: footer.bottom, footerTop: footer.top, bar: bar.top, meta: meta.bottom };
  });
  expect(m.footer).toBeLessThanOrEqual(m.bar);
  expect(m.meta).toBeLessThanOrEqual(m.footerTop);
});

// Minor (a): a refused copy after a successful one never keeps saying "Copied".
test('a refused copy clears an earlier "Copied"', async ({ page, context }, info) => {
  test.skip(info.project.name !== 'desktop');
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/en');
  await gotoScene(page, 'contact', 1);
  await page.getByRole('button', { name: 'Copy email' }).click();
  await expect(page.getByRole('button', { name: 'Copied' })).toBeVisible();
  await page.evaluate(() => {
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: () => Promise.reject(new Error('denied')) },
      configurable: true,
    });
  });
  await page.getByRole('button', { name: 'Copied' }).click();
  // at once, well inside the 1.6 s a success would keep saying "Copied"
  await expect(page.getByRole('button', { name: 'Copy email' })).toBeVisible({ timeout: 300 });
  await expect(page.locator('#contact [aria-live="polite"]')).toHaveText('', { timeout: 300 });
  expect(await page.evaluate(() => String(getSelection()))).toBe('youssef@zakydev.com');
});

// Minor (b): the pill keeps its width while its label swaps, so the profile links never move.
test('the copy pill keeps its width while it says "Copied"', async ({ page, context }, info) => {
  test.skip(info.project.name !== 'desktop');
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/ar');
  await gotoScene(page, 'contact', 1);
  const measure = () =>
    page.evaluate(() => {
      const button = (document.querySelector('#contact [data-copy]') as HTMLElement).getBoundingClientRect();
      const link = (document.querySelector('#contact [data-profile]') as HTMLElement).getBoundingClientRect();
      return { width: button.width, link: link.left };
    });
  const before = await measure();
  await page.getByRole('button', { name: 'انسخ البريد' }).click();
  await expect(page.getByRole('button', { name: 'تم النسخ' })).toBeVisible();
  const after = await measure();
  expect(Math.abs(after.width - before.width)).toBeLessThanOrEqual(0.5);
  expect(Math.abs(after.link - before.link)).toBeLessThanOrEqual(0.5);
});

// Minor (c): Latin runs inside Arabic facts are marked as English.
test('Latin runs in the Arabic contact facts are marked as English', async ({ page }) => {
  await page.goto('/ar');
  await gotoScene(page, 'contact', 1);
  const first = page.locator('#contact [data-contact-meta] li').first();
  await expect(first).toHaveText('البحرين · UTC+3');
  await expect(first.locator('span[lang="en"]')).toHaveText('UTC+3');
});

// Task 11: the background shader (spec 5.8).
// Headless browsers have only software WebGL, which the page refuses (fix round 2); the shader's own tests ask an
// E2E build (NEXT_PUBLIC_E2E=1) to allow it. Tests about the fallback load the plain page.
const SHADER = '/en?bg=soft';
test('background is decorative, behind content, and absent with reduced motion', async ({ page }) => {
  await page.goto(SHADER);
  const canvas = page.locator('canvas[data-bg]');
  await expect(canvas).toHaveAttribute('aria-hidden', 'true');
  expect(await canvas.evaluate((el) => getComputedStyle(el).pointerEvents)).toBe('none');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.reload();
  await expect(page.locator('canvas[data-bg]')).toHaveCount(0);
});

test('text keeps AA contrast over the background in both themes', async ({ page }) => {
  for (const theme of ['dark', 'light']) {
    await page.goto('/en');
    await page.evaluate((t) => {
      document.documentElement.dataset.theme = t;
      document.dispatchEvent(new Event('themechange'));
    }, theme);
    const { default: AxeBuilder } = await import('@axe-core/playwright');
    await settle(page);
    const results = await new AxeBuilder({ page }).withRules(['color-contrast']).analyze();
    expect(results.violations).toEqual([]);
  }
});

// the still fallback gradient sits on a fixed layer behind the page (fix round 1: iOS ignores fixed backgrounds)
const htmlBackground = (page: Page) =>
  page.evaluate(() => getComputedStyle(document.body, '::before').backgroundImage);

test('the background sits fixed behind the gold element and the scenes', async ({ page }) => {
  await page.goto(SHADER);
  const canvas = page.locator('canvas[data-bg]');
  await expect(canvas).toBeVisible();
  const style = await canvas.evaluate((el) => {
    const s = getComputedStyle(el);
    return { position: s.position, z: s.zIndex };
  });
  expect(style).toEqual({ position: 'fixed', z: '0' });
  // the real paint order at the headline: scene content above the gold element above the background
  await page.waitForFunction(() => document.documentElement.classList.contains('enhanced'));
  const order = await page.evaluate(() => {
    const probe = document.createElement('style');
    // decorative layers ignore the pointer; let elementsFromPoint see them for this check only
    probe.textContent = '[data-bg],[data-gold-layer]{pointer-events:auto!important}';
    document.head.append(probe);
    const box = (document.querySelector('h1') as HTMLElement).getBoundingClientRect();
    const stack = document.elementsFromPoint(box.left + box.width / 2, box.top + box.height / 2);
    probe.remove();
    const at = (selector: string) => stack.findIndex((el) => el.matches(selector));
    return {
      content: at('#hero [data-sticky]'),
      gold: at('[data-gold-layer]'),
      background: at('canvas[data-bg]'),
    };
  });
  expect(order.content).toBeGreaterThanOrEqual(0);
  expect(order.content).toBeLessThan(order.gold);
  expect(order.gold).toBeLessThan(order.background);
});

test('with reduced motion the background is the CSS gradient, also when switched on later', async ({
  page,
}) => {
  await page.goto('/en');
  await expect(page.locator('canvas[data-bg]')).toHaveCount(1);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('canvas[data-bg]')).toHaveCount(0);
  expect(await htmlBackground(page)).toContain('radial-gradient');
  await page.reload();
  await page.waitForTimeout(600);
  await expect(page.locator('canvas[data-bg]')).toHaveCount(0);
  expect(await htmlBackground(page)).toContain('radial-gradient');
});

test('without WebGL the canvas is hidden and the CSS gradient shows, with no errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(error.message));
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    // biome-ignore lint/suspicious/noExplicitAny: the stub must accept every overload of getContext
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, ...args: any[]) {
      if (String(args[0]).includes('webgl')) {
        (window as unknown as { glRefused: boolean }).glRefused = true;
        return null;
      }
      return original.apply(this, args as Parameters<typeof original>);
    } as typeof original;
  });
  await page.goto('/en');
  await page.waitForFunction(() => (window as unknown as { glRefused?: boolean }).glRefused === true);
  await page.waitForTimeout(300);
  await expect(page.locator('canvas[data-bg]')).toBeHidden();
  expect(await htmlBackground(page)).toContain('radial-gradient');
  await gotoScene(page, 'work', 0.3);
  await expect(page.locator('canvas[data-bg]')).toBeHidden();
  expect(errors).toEqual([]);
});

// Fix round 1 (review minor 7): the pause, the pixel ratio and a lost context.
const countDraws = () => {
  const draw = WebGLRenderingContext.prototype.drawArrays;
  (window as unknown as { draws: number }).draws = 0;
  WebGLRenderingContext.prototype.drawArrays = function (this: WebGLRenderingContext, ...args) {
    (window as unknown as { draws: number }).draws += 1;
    return draw.apply(this, args);
  } as typeof draw;
};
const drawsOf = (page: Page) => page.evaluate(() => (window as unknown as { draws: number }).draws);
const setHidden = (page: Page, hidden: boolean) =>
  page.evaluate((value) => {
    if (value) {
      Object.defineProperty(document, 'hidden', { configurable: true, get: () => true });
      Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'hidden' });
    } else {
      Reflect.deleteProperty(document, 'hidden');
      Reflect.deleteProperty(document, 'visibilityState');
    }
    document.dispatchEvent(new Event('visibilitychange'));
  }, hidden);

test('the background draws nothing while the tab is hidden, and resumes when it returns', async ({
  page,
}) => {
  await page.addInitScript(countDraws);
  await page.goto(SHADER);
  await expect(page.locator('canvas[data-bg]')).toBeVisible();
  await expect.poll(() => drawsOf(page)).toBeGreaterThan(3);
  await setHidden(page, true);
  const before = await drawsOf(page);
  await page.evaluate(() => window.scrollBy({ top: 600, behavior: 'instant' }));
  await page.waitForTimeout(800);
  expect(await drawsOf(page)).toBe(before);
  await setHidden(page, false);
  await expect.poll(() => drawsOf(page)).toBeGreaterThan(before);
});

test('the background renders at 0.6 of the pixel ratio, capped at 1.5', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 2 });
  await context.addInitScript(() => sessionStorage.setItem('zk-intro', '1'));
  const page = await context.newPage();
  await page.goto(SHADER);
  const canvas = page.locator('canvas[data-bg]');
  await expect(canvas).toBeVisible();
  const size = await canvas.evaluate((el: HTMLCanvasElement) => ({
    width: el.width,
    height: el.height,
    cssWidth: el.clientWidth,
    cssHeight: el.clientHeight,
  }));
  expect(Math.abs(size.width - size.cssWidth * 1.5 * 0.6)).toBeLessThanOrEqual(1);
  expect(Math.abs(size.height - size.cssHeight * 1.5 * 0.6)).toBeLessThanOrEqual(1);
  await context.close();
});

test('a lost GL context hides the background and leaves the CSS gradient, with no errors', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(SHADER);
  const canvas = page.locator('canvas[data-bg]');
  await expect(canvas).toBeVisible();
  await canvas.evaluate((el: HTMLCanvasElement) =>
    el.getContext('webgl')?.getExtension('WEBGL_lose_context')?.loseContext(),
  );
  await expect(canvas).toBeHidden();
  expect(await htmlBackground(page)).toContain('radial-gradient');
  await page.evaluate(() => window.scrollBy({ top: 800, behavior: 'instant' }));
  await page.waitForTimeout(300);
  expect(errors).toEqual([]);
});

// Fix round 2: software WebGL (no GPU, headless CI) gets the CSS gradient, as if WebGL were missing.
test('without a GPU the page refuses software WebGL and shows the CSS gradient', async ({ page }) => {
  await page.addInitScript(() => {
    const getContext = HTMLCanvasElement.prototype.getContext;
    const asked: unknown[] = [];
    (window as unknown as { asked: unknown[] }).asked = asked;
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, ...args: unknown[]) {
      if (String(args[0]).includes('webgl')) asked.push(args[1]);
      return getContext.apply(this, args as Parameters<typeof getContext>);
    } as typeof getContext;
  });
  await page.goto('/en');
  await expect
    .poll(() => page.evaluate(() => (window as unknown as { asked: unknown[] }).asked.length))
    .toBeGreaterThan(0);
  const asked = await page.evaluate(() => (window as unknown as { asked: unknown[] }).asked[0]);
  expect(asked).toMatchObject({ failIfMajorPerformanceCaveat: true });
  // headless Chromium ignores that flag, so the page also refuses a software renderer by name
  const software = await page.evaluate(() => {
    const gl = document.createElement('canvas').getContext('webgl');
    const info = gl?.getExtension('WEBGL_debug_renderer_info');
    const name = gl && info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) : '';
    return gl === null || /swiftshader|llvmpipe|softpipe|basic render driver/i.test(name);
  });
  test.skip(!software, 'this browser has hardware WebGL, so the shader runs');
  await expect(page.locator('canvas[data-bg]')).toBeHidden();
  expect(await htmlBackground(page)).toContain('radial-gradient');
});
