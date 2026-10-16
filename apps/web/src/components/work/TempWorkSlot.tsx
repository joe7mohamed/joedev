'use client';

import { useEffect, useRef } from 'react';
import { pinnedRect, registerSlot } from '@/motion/gold';

/** Temporary slot for the gold frame until the Work scene (Task 7) registers the real one. */
export function TempWorkSlot() {
  const slot = useRef<HTMLDivElement>(null);
  useEffect(
    () =>
      registerSlot('work', (f, layer) => ({
        ...pinnedRect(slot.current as HTMLElement, f.sticky, layer),
        radius: 14,
        fill: 0,
        round: 0,
      })),
    [],
  );
  return <div ref={slot} data-slot className="aspect-[16/10] w-1/2" />;
}
