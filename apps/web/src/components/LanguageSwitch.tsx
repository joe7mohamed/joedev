'use client';

import type { Locale } from '@zakydev/shared';
import { useRouter } from 'next/navigation';
import { type MouseEvent, useLayoutEffect } from 'react';
import { homePath } from '@/lib/home-path';
import { MOTION_OK } from '@/motion/useMedia';

const KEY = 'zk-return-to';
/** The place is the section under the top third of the screen, and how far through its box that line is. */
const READ_LINE = 1 / 3;

/**
 * Where the visitor is, as `section:fraction`. The same measure serves the pinned page and the stacked one: a pinned
 * section's box is its scroll map, the same height in both languages, so the fraction lands on the same moment.
 */
const placeNow = (): string | null => {
  const line = window.innerHeight * READ_LINE;
  for (const section of document.querySelectorAll<HTMLElement>('[data-scene]')) {
    const box = section.getBoundingClientRect();
    if (box.top <= line && box.bottom > line)
      return `${section.id}:${((line - box.top) / box.height).toFixed(4)}`;
  }
  return null;
};

const goTo = (id: string, fraction: number): void => {
  const section = document.getElementById(id);
  if (!section?.hasAttribute('data-scene') || !Number.isFinite(fraction)) return;
  const box = section.getBoundingClientRect();
  window.scrollTo({
    top: window.scrollY + box.top + box.height * fraction - window.innerHeight * READ_LINE,
    behavior: 'instant',
  });
};

/** A click the browser should handle itself: another button, or a modifier asking for a new tab or window. */
const handledByBrowser = (event: MouseEvent<HTMLAnchorElement>): boolean =>
  event.defaultPrevented ||
  event.button !== 0 ||
  event.metaKey ||
  event.ctrlKey ||
  event.shiftKey ||
  event.altKey ||
  (event.currentTarget.target !== '' && event.currentTarget.target !== '_self');

/**
 * Links to the same place in the other language: the section in view and how far through it. A plain primary click
 * is a client-side navigation (router.push): both languages share the one root layout, `[locale]`, so the document
 * stays and the new page mounts in it (KeepRootState carries <html>'s state over). Any other click, and every click
 * without script, is the plain link. It never prefetches: a prefetched other page would apply its font preload here,
 * and English never downloads Amiri. `next/link` would add its prefetch machinery only to turn it off.
 * It must stay inside EngineProvider: on the pinned page the place is restored on the provider's `zk:enhanced` event.
 */
export function LanguageSwitch({ locale, label }: { locale: Locale; label: string }) {
  const other: Locale = locale === 'en' ? 'ar' : 'en';
  const router = useRouter();
  const href = homePath(other);
  // before paint: on the pinned page the place is restored when the engine has measured (`zk:enhanced`, sent from
  // EngineProvider's layout effect, still before paint), so the first painted frame of the new page is already there
  useLayoutEffect(() => {
    let saved: string | null = null;
    try {
      saved = sessionStorage.getItem(KEY);
      sessionStorage.removeItem(KEY);
    } catch {
      return;
    }
    if (!saved) return;
    const [id = '', fraction = ''] = saved.split(':');
    const restore = (): void => goTo(id, Number(fraction));
    // the stacked page's height depends on the text: it is put in place now, before paint, and again once the fonts
    // have arrived and been laid out (one frame later), in case they changed the height
    const restoreStacked = (): void => {
      requestAnimationFrame(restore);
    };
    if (!window.matchMedia(MOTION_OK).matches) {
      restore();
      document.fonts.ready.then(restoreStacked).catch(restoreStacked);
    } else document.addEventListener('zk:enhanced', restore, { once: true });
    return () => document.removeEventListener('zk:enhanced', restore);
  }, []);
  const remember = (): void => {
    const place = placeNow();
    if (!place) return;
    try {
      sessionStorage.setItem(KEY, place);
    } catch {
      // storage unavailable: the other language opens at the top
    }
  };
  const onClick = (event: MouseEvent<HTMLAnchorElement>): void => {
    // a new tab or window: nothing is stored, or this tab would keep a stale place and jump to it on its next load
    if (handledByBrowser(event)) return;
    remember();
    event.preventDefault();
    // the browser's scroll stays (the place is restored above); scrolling to the top first would only flash the hero
    router.push(href, { scroll: false });
  };
  return (
    <a
      href={href}
      hrefLang={other}
      lang={locale === 'ar' ? 'en' : undefined}
      aria-label={label}
      onClick={onClick}
      className="grid size-11 place-items-center rounded-full border border-hair font-semibold"
    >
      {other === 'ar' ? 'ع' : 'EN'}
    </a>
  );
}
