'use client';

import { useCallback, useSyncExternalStore } from 'react';

export const MOTION_OK = '(prefers-reduced-motion: no-preference)';
export const FINE_POINTER = '(hover: hover) and (pointer: fine)';

/** Whether a media query matches. False on the server and during hydration, so nothing moves before it is known. */
export function useMedia(query: string): boolean {
  // one subscription per query, not one per render
  const subscribe = useCallback(
    (onChange: () => void) => {
      const list = window.matchMedia(query);
      list.addEventListener('change', onChange);
      return () => list.removeEventListener('change', onChange);
    },
    [query],
  );
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}
