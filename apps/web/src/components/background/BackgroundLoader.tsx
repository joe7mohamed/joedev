'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { MOTION_OK, useMedia } from '@/motion/useMedia';

// its own chunk, fetched only once the page is idle and motion is allowed
const Background = dynamic(() => import('./Background'), { ssr: false });

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
  const [idle, setIdle] = useState(false);
  useEffect(() => {
    if (!motionOk || idle) return;
    return whenIdle(() => setIdle(true));
  }, [motionOk, idle]);
  return motionOk && idle ? <Background /> : null;
}
