import { expect, type Page } from '@playwright/test';
import { gotoScene, progressOf, test } from './helpers';

/** Spec 5.2 and 9: the language switch changes the route and keeps the scroll position. */

/** The section under the top third of the screen, and how far through its box that point is. */
const placeOf = (page: Page) =>
  page.evaluate(() => {
    const y = window.innerHeight / 3;
    for (const section of document.querySelectorAll<HTMLElement>('[data-scene]')) {
      const box = section.getBoundingClientRect();
      if (box.top <= y && box.bottom > y) return { id: section.id, fraction: (y - box.top) / box.height };
    }
    return { id: '', fraction: 0 };
  });

/** Where each language lives (owner decision 2026-10-17): English at the plain domain, Arabic at /ar. */
const ADDRESS = { en: /^https?:\/\/[^/]+\/$/, ar: /^https?:\/\/[^/]+\/ar$/ } as const;
const HEADLINE = { en: 'I build software that holds up under pressure.', ar: 'أبني برمجيات تصمد تحت الضغط.' };

const switchLanguage = async (page: Page, to: keyof typeof ADDRESS): Promise<void> => {
  await page.locator(`header a[hreflang="${to}"]`).click();
  await page.waitForURL(ADDRESS[to]);
  await page.evaluate(() => document.fonts.ready.then(() => undefined));
};

test('the language switch keeps the position on the stacked page', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready.then(() => undefined));
  // a third of the way into the process section
  await page.evaluate(() => {
    const box = (document.getElementById('process') as HTMLElement).getBoundingClientRect();
    window.scrollTo({
      top: window.scrollY + box.top + box.height / 3 - window.innerHeight / 3,
      behavior: 'instant',
    });
  });
  const before = await placeOf(page);
  expect(before.id).toBe('process');
  await switchLanguage(page, 'ar');
  await expect.poll(async () => (await placeOf(page)).id).toBe('process');
  expect(Math.abs((await placeOf(page)).fraction - before.fraction)).toBeLessThan(0.1);
});

test('the language switch keeps the scene and the progress through it on the pinned page', async ({
  page,
}) => {
  await page.goto('/');
  await gotoScene(page, 'process', 0.5);
  await switchLanguage(page, 'ar');
  await expect.poll(() => progressOf(page, 'process'), { timeout: 5000 }).toBeCloseTo(0.5, 1);
});

test('the switch links to / and /ar, and without script it is a plain link that works both ways', async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('/');
  await expect(page.locator('header a[hreflang="ar"]')).toHaveAttribute('href', '/ar');
  await page.locator('header a[hreflang="ar"]').click();
  await expect(page).toHaveURL(ADDRESS.ar);
  await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
  await expect(page.locator('header a[hreflang="en"]')).toHaveAttribute('href', '/');
  await page.locator('header a[hreflang="en"]').click();
  await expect(page).toHaveURL(ADDRESS.en);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await context.close();
});

for (const motion of ['no-preference', 'reduce'] as const) {
  test(`the switch changes the page in place, without reloading the document (motion: ${motion})`, async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: motion });
    await page.goto('/');
    const theme = await page.locator('html').getAttribute('data-theme');
    // a value on window lives exactly as long as the document: a reload would drop it
    await page.evaluate(() => {
      (window as unknown as { zkSameDocument: boolean }).zkSameDocument = true;
    });
    const sameDocument = () =>
      page.evaluate(() => (window as unknown as { zkSameDocument?: boolean }).zkSameDocument === true);
    for (const [to, dir] of [
      ['ar', 'rtl'],
      ['en', 'ltr'],
    ] as const) {
      await switchLanguage(page, to);
      await expect(page.locator('html')).toHaveAttribute('lang', to);
      await expect(page.locator('html')).toHaveAttribute('dir', dir);
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(HEADLINE[to]);
      expect(await sameDocument(), `still the same document after switching to ${to}`).toBe(true);
      // what the head script set before the first paint survives the switch
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme ?? '');
      if (motion === 'no-preference') await expect(page.locator('html')).toHaveClass(/\benhanced\b/);
    }
  });
}

test('the direction, the language and the theme never disagree with the page on screen during the switch', async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/');
  // a mutation observer runs before the next paint, so it sees every state the visitor could see
  await page.evaluate(() => {
    const seen: string[] = [];
    (window as unknown as { zkSeen: string[] }).zkSeen = seen;
    const html = document.documentElement;
    new MutationObserver(() => {
      const headline = document.querySelector('h1')?.textContent ?? '';
      const text = /[\u0600-\u06ff]/.test(headline) ? 'ar' : 'en';
      seen.push(
        `${html.lang} ${html.dir} ${text} ${html.dataset.theme} ${html.classList.contains('pinned')}`,
      );
    }).observe(document, { attributes: true, childList: true, subtree: true, characterData: true });
  });
  await switchLanguage(page, 'ar');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(HEADLINE.ar);
  const seen = await page.evaluate(() => (window as unknown as { zkSeen: string[] }).zkSeen);
  expect(seen.length).toBeGreaterThan(0);
  expect(new Set(seen.filter((s) => s !== 'en ltr en light true'))).toEqual(
    new Set(['ar rtl ar light true']),
  );
});

test('after the switch the Arabic page loads its headline face', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready.then(() => undefined));
  await switchLanguage(page, 'ar');
  await page.waitForFunction(() =>
    [...document.fonts].some((f) => f.family.replaceAll('"', '') === 'Amiri' && f.status === 'loaded'),
  );
  const family = await page
    .getByRole('heading', { level: 1 })
    .evaluate((h) => getComputedStyle(h).fontFamily.split(',')[0]?.replaceAll('"', '').trim());
  expect(family).toBe('Amiri');
});

test('the browser back and forward buttons move between the languages in place too, theme and all', async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/');
  await page.evaluate(() => {
    (window as unknown as { zkSameDocument: boolean }).zkSameDocument = true;
  });
  await switchLanguage(page, 'ar');
  await page.goBack();
  await page.waitForURL(ADDRESS.en);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(HEADLINE.en);
  await page.goForward();
  await page.waitForURL(ADDRESS.ar);
  await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await expect(page.locator('html')).toHaveClass(/\benhanced\b/);
  expect(
    await page.evaluate(() => (window as unknown as { zkSameDocument?: boolean }).zkSameDocument === true),
  ).toBe(true);
});

/** What one painted frame shows: the headline's language, the scene in view, its progress and what it displays. */
type Shown = {
  lang: string;
  scene: string;
  p: number;
  count: string;
  step: number;
  fade: number;
  zoom: number;
};

/** Samples every animation frame from now on (the sampler lives on window, so it survives a soft navigation). */
const startSampling = (page: Page) =>
  page.evaluate(() => {
    const read = (): Shown => {
      const h1 = document.querySelector('h1');
      const middle = window.innerHeight / 2;
      const section = [...document.querySelectorAll<HTMLElement>('[data-scene][data-state="active"]')].find(
        (s) => {
          const box = s.getBoundingClientRect();
          return box.top <= middle && box.bottom > middle;
        },
      );
      const fade = section?.querySelector<HTMLElement>(':scope > [data-sticky] > [data-fade]');
      const count = document.querySelector('#process [data-count] b')?.textContent ?? '';
      // the step the counter names: its text must be on screen, not fading in
      const step = document.querySelector<HTMLElement>(
        `#process [data-item][data-index="${Number(count) - 1}"]`,
      );
      return {
        lang: !h1 ? 'none' : /[؀-ۿ]/.test(h1.textContent ?? '') ? 'ar' : 'en',
        scene: section?.id ?? 'none',
        p: Number(section?.style.getPropertyValue('--p') || Number.NaN),
        count,
        step: step ? Number(getComputedStyle(step).opacity) : 0,
        fade: fade ? Number(getComputedStyle(fade).opacity) : 0,
        zoom: Number(h1?.style.getPropertyValue('--zs') || 1),
      };
    };
    const w = window as unknown as { zkShown: Shown[]; zkStop: boolean; zkRead: () => Shown };
    w.zkShown = [];
    w.zkStop = false;
    w.zkRead = read;
    const loop = (): void => {
      w.zkShown.push(read());
      if (!w.zkStop) requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  });

for (const [from, to] of [
  ['en', 'ar'],
  ['ar', 'en'],
] as const) {
  for (const [scene, fraction] of [
    ['process', 0.7],
    // far enough into the zoom that the headline is several times its size
    ['hero', 0.7],
  ] as const) {
    test(`every frame of the switch ${from} → ${to} shows the ${scene} scene where it was, never blank`, async ({
      page,
    }) => {
      await page.goto(from === 'en' ? '/' : '/ar');
      await page.evaluate(() => document.fonts.ready.then(() => undefined));
      await gotoScene(page, scene, fraction);
      await startSampling(page);
      const before = await page.evaluate(() => (window as unknown as { zkRead: () => Shown }).zkRead());
      expect(before.scene).toBe(scene);
      if (scene === 'process') expect(before.count).toBe('04');
      if (scene === 'hero') expect(before.zoom).toBeGreaterThan(1.5);
      await page.locator(`header a[hreflang="${to}"]`).click();
      await page.waitForURL(ADDRESS[to]);
      // until the new page has been on screen for a second
      await page.waitForFunction(
        (lang) =>
          (window as unknown as { zkShown: Shown[] }).zkShown.filter((s) => s.lang === lang).length > 60,
        to,
      );
      const shown = await page.evaluate(() => {
        const w = window as unknown as { zkShown: Shown[]; zkStop: boolean };
        w.zkStop = true;
        return w.zkShown;
      });
      expect(
        shown.filter((s) => s.lang === 'none'),
        'frames without a page',
      ).toEqual([]);
      const wrong = shown
        .map((s, frame) => ({ frame, ...s }))
        .filter((s) => s.lang === to)
        .filter(
          (s) =>
            s.scene !== before.scene ||
            !(Math.abs(s.p - before.p) < 0.02) ||
            s.count !== before.count ||
            Math.abs(s.step - before.step) > 0.05 ||
            Math.abs(s.fade - before.fade) > 0.05 ||
            Math.abs(s.zoom - before.zoom) > 0.05 * before.zoom,
        );
      expect(wrong, `before the switch: ${JSON.stringify(before)}`).toEqual([]);
    });
  }
}

test('a modified click on the switch is left to the browser: a new tab, and this page stays as it is', async ({
  page,
  context,
}) => {
  await page.goto('/');
  const opened = context.waitForEvent('page');
  await page.locator('header a[hreflang="ar"]').click({ modifiers: ['ControlOrMeta'] });
  const tab = await opened;
  await tab.waitForLoadState();
  await expect(tab).toHaveURL(ADDRESS.ar);
  await expect(page).toHaveURL(ADDRESS.en);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
});

// URL round re-review: a click left to the browser stores no place, so no stale one waits in this tab and moves it on
// its next load.
test('a modified click on the switch leaves no place behind: a reload of this tab does not jump', async ({
  page,
  context,
}) => {
  await page.goto('/');
  await gotoScene(page, 'process', 0.5);
  const opened = context.waitForEvent('page');
  await page.locator('header a[hreflang="ar"]').click({ modifiers: ['ControlOrMeta'] });
  await (await opened).waitForLoadState();
  expect(await page.evaluate(() => sessionStorage.getItem('zk-return-to'))).toBeNull();
  // back at the top, then a reload: the page must stay on the hero
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await page.reload();
  await page.waitForFunction(() => document.documentElement.classList.contains('enhanced'));
  await page.waitForTimeout(700);
  expect((await placeOf(page)).id).toBe('hero');
  expect(await page.evaluate(() => window.scrollY)).toBeLessThan(10);
});

test('the switch never prefetches the other page, not on view, hover or focus', async ({ page }) => {
  const fetched: string[] = [];
  page.on('request', (r) => {
    if (new URL(r.url()).pathname === '/ar') fetched.push(r.url());
  });
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await page.locator('header a[hreflang="ar"]').hover();
  await page.locator('header a[hreflang="ar"]').focus();
  await page.waitForTimeout(500);
  expect(fetched).toEqual([]);
});
