'use client';

import { type ReactNode, useEffect, useRef, useState } from 'react';
import type { ShotSources } from '@/lib/shot-files';
import { releasePage, runLoader } from './sequence';
import './loader.css';

/**
 * A loader that goes away before it finished (the page unmounts mid-count) releases the page at once. The release
 * waits one task, so React's development double-run of effects (unmount, mount again) does not end the loader.
 */
let pendingRelease = 0;

/**
 * The one-time loading screen (spec 5.1): the mark's two halves search for each other while the fonts and the
 * project screenshots load, a counter runs to 100, then they lock and the mark flies onto the header's.
 * The server and the first client render are this markup; loader.css shows it only under html.loading, which
 * the head script sets on the first visit of a session. Without it the overlay leaves the DOM after mount.
 * It is decoration only: hidden from assistive technology, which reads the page underneath from the start.
 * `children` is the overlay's drawing and counter (LoaderArt), rendered on the server.
 */
export function Loader({ images, children }: { images: ShotSources[]; children: ReactNode }) {
  const [on, setOn] = useState(true);
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = root.current;
    if (!el || !document.documentElement.classList.contains('loading')) {
      setOn(false);
      return;
    }
    window.clearTimeout(pendingRelease);
    const stop = runLoader(el, images, () => setOn(false));
    return () => {
      stop();
      pendingRelease = window.setTimeout(releasePage, 0);
    };
  }, [images]);
  if (!on) return null;
  return (
    <div ref={root} data-loader aria-hidden="true">
      {children}
    </div>
  );
}
