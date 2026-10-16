'use client';

import { useEffect, useRef, useState } from 'react';

const FINE_POINTER = '(hover: hover) and (pointer: fine)';
const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';
const TARGETS = 'a, button';

/**
 * A gold ring that follows a mouse with a short lag (the transition in header.css) and grows over links and
 * buttons (spec 5.9). Mounted only for a fine pointer with motion allowed; never takes clicks.
 */
export function PointerRing() {
  const ring = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia(FINE_POINTER);
    const reduced = window.matchMedia(REDUCED_MOTION);
    const update = (): void => setEnabled(fine.matches && !reduced.matches);
    update();
    fine.addEventListener('change', update);
    reduced.addEventListener('change', update);
    return () => {
      fine.removeEventListener('change', update);
      reduced.removeEventListener('change', update);
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;
    let seeding = 0;
    /** The first position is set without the lag, so the ring appears under the pointer instead of flying in. */
    const seed = (el: HTMLElement): void => {
      el.style.transition = 'none';
      // one frame renders the position without a transition; the next turns the transition back on and shows it
      seeding = requestAnimationFrame(() => {
        seeding = requestAnimationFrame(() => {
          seeding = 0;
          el.style.transition = '';
          el.toggleAttribute('data-live', true);
        });
      });
    };
    const move = (event: PointerEvent): void => {
      const el = ring.current;
      if (!el || event.pointerType !== 'mouse') return;
      el.style.translate = `${event.clientX}px ${event.clientY}px`;
      if (!el.hasAttribute('data-live') && !seeding) seed(el);
      const big = Boolean((event.target as Element | null)?.closest?.(TARGETS));
      if (el.hasAttribute('data-big') !== big) el.toggleAttribute('data-big', big);
    };
    // the pointer left the window: hide the ring rather than leave it at the edge
    const out = (event: PointerEvent): void => {
      if (!event.relatedTarget) ring.current?.removeAttribute('data-live');
    };
    document.addEventListener('pointermove', move, { passive: true });
    document.addEventListener('pointerout', out);
    return () => {
      cancelAnimationFrame(seeding);
      document.removeEventListener('pointermove', move);
      document.removeEventListener('pointerout', out);
    };
  }, [enabled]);

  if (!enabled) return null;
  return <div ref={ring} data-ring aria-hidden="true" />;
}
