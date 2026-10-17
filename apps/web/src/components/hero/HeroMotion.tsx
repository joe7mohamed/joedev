'use client';

import { type ReactNode, useEffect, useRef } from 'react';
import { engine, type SceneFrame } from '@/motion/engine';
import { pinnedRect, registerSlot } from '@/motion/gold';
import { whenLoaded } from '@/motion/loaded';
import { clamp, range, smooth } from '@/motion/math';
import { FINE_POINTER, MOTION_OK, useMedia } from '@/motion/useMedia';
import { useSceneFrame } from '@/motion/useSceneFrame';
import { trackPointerWeight } from './pointerWeight';

/** The pointer weight shows only before the zoom has visibly begun. */
const POINTER_UNTIL = 0.12;
/** Spec 5.0: the underline is 4–7 px high. */
const MIN_LINE = 4;
/**
 * The underline draws in once the headline has built (prototype `play()`: delay 1.05 s, 0.9 s). The build starts
 * with the first paint (hero-intro.css), or when the loading screen releases it, so the delay is counted on the
 * page clock from that origin (motion/loaded.ts).
 */
const DRAW_AT = 1050;
const DRAW_MS = 900;
const inOut = (t: number): number => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

type Parts = { root: HTMLElement; h1: HTMLElement; key: HTMLElement; slot: HTMLElement; sticky: HTMLElement };
/** The zoom word's untransformed centre and the scene's size, both in the pinned scene's coordinates. */
type Geometry = { cx: number; cy: number; w: number; h: number };

const partsOf = (root: HTMLElement | null): Parts | null => {
  const h1 = root?.querySelector<HTMLElement>('h1');
  const key = root?.querySelector<HTMLElement>('[data-key]');
  const slot = root?.querySelector<HTMLElement>('[data-slot]');
  const sticky = root?.closest<HTMLElement>('[data-sticky]');
  return root && h1 && key && slot && sticky ? { root, h1, key, slot, sticky } : null;
};

/** Measures with the zoom cleared; offsets are relative to the h1, which is the zoom word's offset parent. */
const measure = ({ h1, key, sticky }: Parts): Geometry => {
  h1.style.transform = 'none';
  const s = sticky.getBoundingClientRect();
  const b = h1.getBoundingClientRect();
  h1.style.transform = '';
  const kx = key.offsetLeft + key.offsetWidth / 2;
  const ky = key.offsetTop + key.offsetHeight / 2;
  h1.style.transformOrigin = `${kx}px ${ky}px`;
  return { cx: b.left - s.left + kx, cy: b.top - s.top + ky, w: sticky.clientWidth, h: sticky.clientHeight };
};

/** Writes the hero's scroll state as custom properties; hero-motion.css turns them into styles under html.enhanced. */
const paint = ({ root, h1 }: Parts, g: Geometry, progress: number): void => {
  const z = range(progress, 0.1, 0.8);
  const pull = smooth(z * 1.5);
  const side = 1 - range(progress, 0.02, 0.2);
  h1.style.setProperty('--zx', `${((g.w / 2 - g.cx) * pull).toFixed(2)}px`);
  h1.style.setProperty('--zy', `${((g.h / 2 - g.cy) * pull).toFixed(2)}px`);
  h1.style.setProperty('--zs', (1 + z * z * 15).toFixed(4));
  h1.style.setProperty('--others', (1 - range(z, 0, 0.38)).toFixed(3));
  h1.style.setProperty('--img', range(z, 0.28, 0.3).toFixed(3));
  h1.style.setProperty('--shown', (1 - range(z, 0.84, 0.16)).toFixed(3));
  root.style.setProperty('--side', side.toFixed(3));
  root.toggleAttribute('data-side-off', side < 0.5);
};

type Zoom = { apply(f: SceneFrame): void; remeasure(): void };

/** Draws the underline in, DRAW_AT after the build's origin; reads 1 at once when motion is reduced. */
const startDrawIn = (): { drawn(): number; stop(): void } => {
  let drawn = window.matchMedia(MOTION_OK).matches ? 0 : 1;
  let raf = 0;
  let origin = 0;
  const draw = (now: number): void => {
    drawn = inOut(clamp((now - origin - DRAW_AT) / DRAW_MS));
    engine.invalidate();
    raf = drawn < 1 ? requestAnimationFrame(draw) : 0;
  };
  const stopWaiting =
    drawn < 1
      ? whenLoaded((at) => {
          origin = at;
          raf = requestAnimationFrame(draw);
        })
      : () => undefined;
  return {
    drawn: () => drawn,
    stop: () => {
      stopWaiting();
      cancelAnimationFrame(raf);
    },
  };
};

/**
 * The hero's gold slot: the underline under the zoom word. This is a live slot (spec 6.4): it reads layout every
 * frame, because the slot sits inside the zooming h1, and before reading it applies the zoom for the same frame.
 * The gold element subscribes to the engine before the hero does, so it would otherwise read last frame's zoom.
 * `zoom.apply` is idempotent per progress value and only writes the hero's custom properties.
 */
const registerHeroSlot = (parts: Parts, zoom: Zoom, drawn: () => number, rtl: boolean): (() => void) =>
  registerSlot('hero', (f, layer) => {
    zoom.apply(f);
    const r = pinnedRect(parts.slot, f.sticky, layer);
    const w = r.w * drawn();
    return {
      x: rtl ? r.x + r.w - w : r.x,
      y: r.y,
      w,
      h: Math.max(MIN_LINE, r.h),
      radius: 2,
      fill: 0,
      round: 0,
    };
  });

/** The scroll zoom: measures the zoom word once per resize or font load, then only does arithmetic per frame. */
const createZoom = (parts: Parts, onLive: (live: boolean) => void): Zoom => {
  let geometry = measure(parts);
  let last = Number.NaN;
  const section = parts.root.closest('[data-scene]');
  return {
    apply(f) {
      // a hero that flows (large text, short screens) does not zoom
      const unpinned = section?.hasAttribute('data-unpinned') ?? false;
      onLive(f.progress < POINTER_UNTIL && !unpinned);
      const progress = unpinned ? 0 : f.progress;
      if (progress === last) return;
      last = progress;
      paint(parts, geometry, progress);
    },
    remeasure() {
      geometry = measure(parts);
      last = Number.NaN;
      engine.invalidate();
    },
  };
};

/** Re-measures whenever the scene, the hero column or the headline changes size, and when fonts load. */
const watchLayout = (parts: Parts, remeasure: () => void): (() => void) => {
  const observer = new ResizeObserver(remeasure);
  for (const el of [parts.sticky, parts.root, parts.h1]) observer.observe(el);
  const fonts = document.fonts;
  fonts?.ready.then(remeasure).catch(() => undefined);
  fonts?.addEventListener('loadingdone', remeasure);
  return () => {
    observer.disconnect();
    fonts?.removeEventListener('loadingdone', remeasure);
  };
};

/**
 * The hero's moving parts around server-rendered content: the scroll zoom into the key word, the fade of
 * everything around the headline, the gold underline slot, the line drawing in after the build, and the
 * pointer weight on English letters. Every value it writes is only read by enhanced styles.
 */
export function HeroMotion({
  children,
  rtl,
  byLetter,
}: {
  children: ReactNode;
  rtl: boolean;
  byLetter: boolean;
}) {
  const root = useRef<HTMLDivElement>(null);
  const frameRef = useRef<(f: SceneFrame) => void>(() => undefined);
  const live = useRef(false);
  const weight = useRef<{ clear(): void } | null>(null);
  const moving = useMedia(MOTION_OK);
  const fine = useMedia(FINE_POINTER);
  useSceneFrame('hero', (f) => frameRef.current(f));

  useEffect(() => {
    const parts = partsOf(root.current);
    if (!parts) return;
    const zoom = createZoom(parts, (now) => {
      if (live.current && !now) weight.current?.clear();
      live.current = now;
    });
    frameRef.current = zoom.apply;
    const unwatch = watchLayout(parts, zoom.remeasure);
    const drawIn = startDrawIn();
    const unregister = registerHeroSlot(parts, zoom, drawIn.drawn, rtl);
    // a control that fades out with the scroll is brought back into view when it receives keyboard focus
    const onFocus = (): void => {
      if (Number(parts.root.style.getPropertyValue('--side') || 1) < 0.99)
        requestAnimationFrame(() => engine.scrollToScene('hero', 0));
    };
    parts.root.addEventListener('focusin', onFocus);
    return () => {
      drawIn.stop();
      unwatch();
      unregister();
      parts.root.removeEventListener('focusin', onFocus);
      frameRef.current = () => undefined;
    };
  }, [rtl]);

  useEffect(() => {
    const h1 = root.current?.querySelector<HTMLElement>('h1');
    if (!h1 || !byLetter || !moving || !fine) return;
    const tracker = trackPointerWeight(h1, () => live.current);
    weight.current = tracker;
    return () => {
      weight.current = null;
      tracker.dispose();
    };
  }, [byLetter, moving, fine]);

  return (
    <div ref={root} data-fade data-hero>
      {children}
    </div>
  );
}
