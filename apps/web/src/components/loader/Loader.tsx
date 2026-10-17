'use client';

import { useEffect, useRef, useState } from 'react';
import { FULL } from '@/components/Mark';
import { runLoader } from './sequence';
import './loader.css';

/** The overlay mark's size without styles; loader.css sizes it to the viewport. */
const SIZE = 170;

const stroke = {
  fill: 'none',
  strokeWidth: FULL.width,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const;

/**
 * The one-time loading screen (spec 5.1): the mark's two halves search for each other while the fonts and the
 * project screenshots load, a counter runs to 100, then they lock and the mark flies onto the header's.
 * The server and the first client render are this markup; loader.css shows it only under html.loading, which
 * the head script sets on the first visit of a session. Without it the overlay leaves the DOM after mount.
 * It is decoration only: hidden from assistive technology, which reads the page underneath from the start.
 */
export function Loader({ images }: { images: string[] }) {
  const [on, setOn] = useState(true);
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = root.current;
    if (!el || !document.documentElement.classList.contains('loading')) {
      setOn(false);
      return;
    }
    return runLoader(el, images, () => setOn(false));
  }, [images]);
  if (!on) return null;
  return (
    <div ref={root} data-loader aria-hidden="true">
      <svg viewBox="0 0 64 64" width={SIZE} height={SIZE} aria-hidden="true">
        <g data-half="a">
          <path d={FULL.upper} stroke="var(--ink)" {...stroke} />
        </g>
        <g data-half="b">
          <path d={FULL.lower} stroke="var(--gold)" {...stroke} />
        </g>
        <circle data-spark cx="32" cy="32" r="3" />
      </svg>
      <div data-loader-meter>
        <span data-loader-count dir="ltr">
          <b>00</b>%
        </span>
        <i data-loader-track>
          <u />
        </i>
      </div>
    </div>
  );
}
