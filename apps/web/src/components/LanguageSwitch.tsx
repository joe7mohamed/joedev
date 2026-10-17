'use client';

import type { Locale } from '@zakydev/shared';
import { useEffect } from 'react';
import { engine, type SceneId } from '@/motion/engine';
import { MOTION_OK } from '@/motion/useMedia';

const KEY = 'zk-return-to';
/** On the stacked page the place is the section under the top third of the screen. */
const READ_LINE = 1 / 3;

const isEnhanced = (): boolean => document.documentElement.classList.contains('enhanced');

/**
 * Where the visitor is, as `mode:section:fraction`. Enhanced, the fraction is the progress through the active scene's
 * body (the engine's `--p`); stacked (reduced motion), it is how far through the section's box the reading line is.
 */
const placeNow = (): string | null => {
  if (isEnhanced()) {
    const active = document.querySelector<HTMLElement>('[data-scene][data-state="active"]');
    return active
      ? `pinned:${active.id}:${getComputedStyle(active).getPropertyValue('--p').trim() || '0'}`
      : null;
  }
  const line = window.innerHeight * READ_LINE;
  for (const section of document.querySelectorAll<HTMLElement>('[data-scene]')) {
    const box = section.getBoundingClientRect();
    if (box.top <= line && box.bottom > line)
      return `stacked:${section.id}:${((line - box.top) / box.height).toFixed(4)}`;
  }
  return null;
};

/** Returns to a saved place: through the engine on the enhanced page, by plain scrolling on the stacked one. */
const goTo = (mode: string, id: string, fraction: number): void => {
  if (!Number.isFinite(fraction)) return;
  if (isEnhanced()) {
    engine.scrollToScene(id as SceneId, mode === 'pinned' ? fraction : 0);
    return;
  }
  const section = document.getElementById(id);
  if (!section?.hasAttribute('data-scene')) return;
  const box = section.getBoundingClientRect();
  const at = mode === 'stacked' ? fraction : 0;
  window.scrollTo({
    top: window.scrollY + box.top + box.height * at - window.innerHeight * READ_LINE,
    behavior: 'instant',
  });
};

/** Links to the same place in the other language: the section in view and how far through it. */
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
    const [mode = '', id = '', fraction = ''] = saved.split(':');
    // wait one frame so the layout (the tall enhanced one, or the stacked one) and the fonts are measured first
    const restore = (): void => {
      requestAnimationFrame(() => goTo(mode, id, Number(fraction)));
    };
    if (isEnhanced()) restore();
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
    <a
      href={`/${other}`}
      hrefLang={other}
      lang={locale === 'ar' ? 'en' : undefined}
      aria-label={label}
      onClick={remember}
      className="grid size-11 place-items-center rounded-full border border-hair font-semibold"
    >
      {other === 'ar' ? 'ع' : 'EN'}
    </a>
  );
}
