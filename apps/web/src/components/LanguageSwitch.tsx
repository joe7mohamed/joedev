'use client';

import type { Locale } from '@zakydev/shared';
import Link from 'next/link';
import { useLayoutEffect } from 'react';
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

/**
 * Links to the same place in the other language: the section in view and how far through it. It is a client-side
 * navigation: both languages share the one root layout, `[locale]`, so the document stays and the new page mounts in
 * it (KeepRootState carries <html>'s state over). Without script it is a plain link and the page opens at the top.
 */
export function LanguageSwitch({ locale, label }: { locale: Locale; label: string }) {
  const other: Locale = locale === 'en' ? 'ar' : 'en';
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
  return (
    <Link
      href={href}
      // the place is restored above; scrolling to the top first would only flash the hero
      scroll={false}
      // a prefetch would apply the other page's font preload here, and English never downloads Amiri
      prefetch={false}
      hrefLang={other}
      lang={locale === 'ar' ? 'en' : undefined}
      aria-label={label}
      onClick={remember}
      className="grid size-11 place-items-center rounded-full border border-hair font-semibold"
    >
      {other === 'ar' ? 'ع' : 'EN'}
    </Link>
  );
}
