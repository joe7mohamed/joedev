'use client';

import { useEffect, useRef } from 'react';
import { engine, type SceneId } from './engine';
import { readSlot, resolveGold } from './gold';
import './gold.css';

const ORDER: SceneId[] = ['hero', 'work', 'process', 'about', 'contact'];

/**
 * The one gold element. The outer box sits exactly on the slot rectangles; the face inside it draws the shape and
 * holds `#gold-content`, and only the face floats and tilts (home.css), so the box always matches its slot.
 */
export function GoldElement() {
  const layer = useRef<HTMLDivElement>(null);
  const node = useRef<HTMLDivElement>(null);
  useEffect(() => {
    // every value is written only when the shape changed, so a frame that moves nothing restyles nothing
    let written = '';
    const root = document.documentElement;
    const unsubscribe = engine.subscribe((frames, scroll) => {
      const el = node.current;
      if (!el || !layer.current) return;
      const shape = resolveGold(ORDER, frames, scroll.y, readSlot(layer.current));
      const next = !shape || shape.w < 2 ? `hidden ${shape?.on ?? ''}` : JSON.stringify(shape);
      if (next === written) return;
      written = next;
      // which scene the gold element is on: a slot it is not on draws its own stand-in (the rail line, the ring)
      if (!shape) delete root.dataset.goldOn;
      else if (root.dataset.goldOn !== shape.on) root.dataset.goldOn = shape.on;
      // the screen is solid gold (the contact flood): nothing behind it needs drawing (Background)
      const full =
        !!shape &&
        shape.fill >= 1 &&
        shape.x <= 0 &&
        shape.y <= 0 &&
        shape.x + shape.w >= layer.current.clientWidth &&
        shape.y + shape.h >= layer.current.clientHeight;
      root.toggleAttribute('data-gold-full', full);
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
    });
    return () => {
      unsubscribe();
      delete root.dataset.goldOn;
      root.removeAttribute('data-gold-full');
    };
  }, []);
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
