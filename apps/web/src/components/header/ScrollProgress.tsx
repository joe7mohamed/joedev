'use client';

import { useEffect, useRef } from 'react';
import { engine } from '@/motion/engine';
import { clamp } from '@/motion/math';

/** The 2 px bar at the very top: how far down the page the visitor is (spec 5.9). */
export function ScrollProgress() {
  const bar = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let written = '';
    return engine.subscribe((frames, scroll) => {
      // the last scene ends where the page ends, so its end is the full scroll length
      const end = frames.get('contact')?.end ?? 0;
      const value = end > 0 ? clamp(scroll.y / end).toFixed(4) : '0';
      if (value === written || !bar.current) return;
      written = value;
      bar.current.style.transform = `scaleX(${value})`;
    });
  }, []);
  return <div ref={bar} data-progress aria-hidden="true" />;
}
