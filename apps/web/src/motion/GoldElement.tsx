'use client';

import { useEffect, useRef } from 'react';
import { engine, type SceneId } from './engine';
import { readSlot, resolveGold } from './gold';

const ORDER: SceneId[] = ['hero', 'work', 'process', 'about', 'contact'];

/**
 * The one gold element. The outer box sits exactly on the slot rectangles; the face inside it draws the shape and
 * holds `#gold-content`, and only the face floats and tilts (home.css), so the box always matches its slot.
 */
export function GoldElement() {
  const layer = useRef<HTMLDivElement>(null);
  const node = useRef<HTMLDivElement>(null);
  useEffect(
    () =>
      engine.subscribe((frames, scroll) => {
        const el = node.current;
        if (!el || !layer.current) return;
        const shape = resolveGold(ORDER, frames, scroll.y, readSlot(layer.current));
        if (!shape || shape.w < 2) {
          el.style.visibility = 'hidden';
          return;
        }
        const tilt = shape.tilt ?? 0;
        el.style.visibility = 'visible';
        el.style.transform = `translate3d(${shape.x}px, ${shape.y}px, 0)`;
        el.style.width = `${shape.w}px`;
        el.style.height = `${Math.max(3, shape.h)}px`;
        el.style.borderRadius = `${shape.radius + shape.round * Math.min(shape.w, shape.h) * 0.5}px`;
        el.style.setProperty('--fill', shape.fill.toFixed(3));
        el.style.setProperty('--tilt', tilt.toFixed(3));
        el.toggleAttribute('data-tilt', tilt > 0.001);
        el.dataset.thin = shape.h < 12 ? 'true' : 'false';
      }),
    [],
  );
  return (
    <div ref={layer} data-gold-layer aria-hidden="true">
      <div ref={node} data-gold>
        <div data-gold-face>
          <div id="gold-content" />
        </div>
      </div>
    </div>
  );
}
