'use client';

import type { Locale } from '@zakydev/shared';
import { useEffect } from 'react';
import { engine, type SceneId } from '@/motion/engine';

const KEY = 'zk-return-to';

/** Links to the same place in the other language: the scene in view and how far through it. */
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
    const [id, fraction] = saved.split(':');
    const restore = (): void => {
      // wait one frame so the tall enhanced layout and fonts are measured first
      requestAnimationFrame(() => engine.scrollToScene(id as SceneId, Number(fraction)));
    };
    if (document.documentElement.classList.contains('enhanced')) restore();
    else document.addEventListener('zk:enhanced', restore, { once: true });
    return () => document.removeEventListener('zk:enhanced', restore);
  }, []);
  const remember = (): void => {
    const active = document.querySelector<HTMLElement>('[data-scene][data-state="active"]');
    if (!active) return;
    try {
      sessionStorage.setItem(
        KEY,
        `${active.id}:${getComputedStyle(active).getPropertyValue('--p').trim() || '0'}`,
      );
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
