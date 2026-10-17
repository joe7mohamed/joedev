'use client';

import { type ComponentType, useEffect, useState } from 'react';
import { MOTION_OK, useMedia } from '@/motion/useMedia';

/** Safari has no requestIdleCallback: wait this long instead. */
const FALLBACK_MS = 200;
/** A page that never goes idle still gets its background after this long. */
const IDLE_TIMEOUT_MS = 2000;

/** Waits for the browser to be idle, so the background never delays first paint. */
const whenIdle = (run: () => void): (() => void) => {
  if (typeof window.requestIdleCallback === 'function') {
    const id = window.requestIdleCallback(run, { timeout: IDLE_TIMEOUT_MS });
    return () => window.cancelIdleCallback(id);
  }
  const id = window.setTimeout(run, FALLBACK_MS);
  return () => window.clearTimeout(id);
};

/**
 * Mounts the shader background once the page is idle, and only while motion is allowed: with reduced motion
 * (also when it is switched on later) it is unmounted, which releases its GL context, and the CSS gradient shows.
 */
export function BackgroundLoader() {
  const motionOk = useMedia(MOTION_OK);
  const [Background, setBackground] = useState<ComponentType | null>(null);
  useEffect(() => {
    if (!motionOk || Background) return;
    let cancelled = false;
    // its own chunk, fetched only once the page is idle and motion is allowed. A plain import(), not next/dynamic:
    // the client never renders it on the server, and next/dynamic's loader would add to every page's scripts.
    const stopWaiting = whenIdle(() => {
      import('./Background')
        .then((module) => {
          if (!cancelled) setBackground(() => module.default);
        })
        // the chunk failed to load (offline, a new deployment): the CSS gradient stays, as without WebGL
        .catch(() => undefined);
    });
    return () => {
      cancelled = true;
      stopWaiting();
    };
  }, [motionOk, Background]);
  return motionOk && Background ? <Background /> : null;
}
