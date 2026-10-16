import { expect, type Page } from '@playwright/test';
import { gotoScene, progressOf, test } from './helpers';

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
  await largeText(page);
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

// Enable this test in Task 8, once the work and process scenes exist.
test.fixme('without JavaScript every project and every process step is shown', async ({ browser }) => {
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
