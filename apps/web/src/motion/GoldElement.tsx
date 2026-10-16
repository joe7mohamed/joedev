'use client';

import { useEffect, useRef } from 'react';
import { engine, type SceneId } from './engine';
import { readSlot, resolveGold } from './gold';

const ORDER: SceneId[] = ['hero', 'work', 'process', 'about', 'contact'];

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
        el.style.visibility = 'visible';
        el.style.transform = `translate3d(${shape.x}px, ${shape.y}px, 0)`;
        el.style.width = `${shape.w}px`;
        el.style.height = `${Math.max(3, shape.h)}px`;
        el.style.borderRadius = `${shape.radius + shape.round * Math.min(shape.w, shape.h) * 0.5}px`;
        el.style.setProperty('--fill', shape.fill.toFixed(3));
        el.dataset.thin = shape.h < 12 ? 'true' : 'false';
      }),
    [],
  );
  return (
    <div ref={layer} data-gold-layer aria-hidden="true">
      <div ref={node} data-gold>
        <div id="gold-content" />
      </div>
    </div>
  );
}
