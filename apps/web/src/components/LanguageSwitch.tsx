'use client';

import type { Locale } from '@zakydev/shared';
import Link from 'next/link';
import { useEffect } from 'react';
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
  useEffect(() => {
    let saved: string | null = null;
    try {
      saved = sessionStorage.getItem(KEY);
      sessionStorage.removeItem(KEY);
    } catch {
      return;
    }
    if (!saved) return;
    const [id = '', fraction = ''] = saved.split(':');
    // wait one frame so the layout (the tall enhanced one, or the stacked one) and the fonts are measured first
    const restore = (): void => {
      requestAnimationFrame(() => goTo(id, Number(fraction)));
    };
    if (document.documentElement.classList.contains('enhanced')) restore();
    else if (!window.matchMedia(MOTION_OK).matches) document.fonts.ready.then(restore).catch(restore);
    else document.addEventListener('zk:enhanced', restore, { once: true });
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
      href={homePath(other)}
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
