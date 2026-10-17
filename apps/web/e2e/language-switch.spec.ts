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
