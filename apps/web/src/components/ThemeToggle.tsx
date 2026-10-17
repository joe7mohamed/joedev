'use client';

import type { MouseEvent, ReactNode } from 'react';

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';

const applyTheme = (): void => {
  const root = document.documentElement;
  const next = root.dataset.theme === 'light' ? 'dark' : 'light';
  root.dataset.theme = next;
  try {
    localStorage.setItem('zk-theme', next);
  } catch {
    // private mode: the choice lasts for this page only
  }
  document.dispatchEvent(new Event('themechange'));
};

/**
 * Switches between the dark and light themes. Where the View Transitions API exists and motion is allowed, the
 * new theme is revealed in a circle growing from the click (spec 5.9); otherwise it switches at once. `children` is
 * its icon, rendered on the server (Header).
 */
export function ThemeToggle({ label, children }: { label: string; children: ReactNode }) {
  const toggle = (event: MouseEvent<HTMLButtonElement>): void => {
    if (typeof document.startViewTransition !== 'function' || window.matchMedia(REDUCED_MOTION).matches) {
      applyTheme();
      return;
    }
    // a keyboard press has no pointer position: grow from the button's centre instead
    const box = event.currentTarget.getBoundingClientRect();
    const fromPointer = event.detail > 0;
    const x = fromPointer ? event.clientX : box.left + box.width / 2;
    const y = fromPointer ? event.clientY : box.top + box.height / 2;
    const root = document.documentElement;
    root.style.setProperty('--vx', `${x}px`);
    root.style.setProperty('--vy', `${y}px`);
    document.startViewTransition(applyTheme);
  };
  return (
    <button
      type="button"
      aria-label={label}
      onClick={toggle}
      data-theme-toggle
      className="grid size-11 place-items-center rounded-full border border-hair"
    >
      {children}
    </button>
  );
}
