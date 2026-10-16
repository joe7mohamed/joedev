'use client';

import { useSyncExternalStore } from 'react';

export const MOTION_OK = '(prefers-reduced-motion: no-preference)';
export const FINE_POINTER = '(hover: hover) and (pointer: fine)';

/** Whether a media query matches. False on the server and during hydration, so nothing moves before it is known. */
export function useMedia(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const list = window.matchMedia(query);
      list.addEventListener('change', onChange);
      return () => list.removeEventListener('change', onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}
