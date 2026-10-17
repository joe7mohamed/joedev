'use client';

import { type RefObject, useEffect, useLayoutEffect, useRef } from 'react';
import { engine, type SceneId } from './engine';
import { useSceneFrame } from './useSceneFrame';

/** The items of a scene that shows one at a time (projects, steps): `[data-item]` with `data-index`. */
const ITEM = '[data-item]';
/** The part of an item below the words that name it, which waits to be found while the item is not in view. */
const BODY = '[data-item-body]';

const indexOf = (target: EventTarget | null): number => {
  const item = target instanceof Element ? target.closest<HTMLElement>(ITEM) : null;
  return item ? Number(item.dataset.index) : -1;
};

/**
 * While the scene plays (`live`), only item `at` shows. The others stay in the accessibility tree and in the
 * reading order with their names (spec 6.4: screen readers work natively); they are hidden from sight only
 * (opacity, in the scene's CSS), and their bodies are `hidden="until-found"`, so find-in-page reaches them and they
 * add no tab stops. Finding one (`beforematch`) or focusing one scrolls the scene to that item's segment, where it
 * is the one in view; if that re-render took the focus away, it returns to the item now in view.
 *
 * All items share one grid cell, so the cell must stay as tall as the tallest item for the engine's fit check (pin or
 * flow): a body waiting to be found takes no space, so the tallest item is measured with every body shown
 * (`data-measuring`, in one synchronous read, never painted) and kept as the cell's minimum height. That happens on
 * every layout change only, never in the frame loop.
 */
export function useHiddenItems(
  scene: SceneId,
  container: RefObject<HTMLElement | null>,
  live: boolean,
  at: number,
  count: number,
): void {
  const current = useRef(at);
  const playing = useRef(live);
  const layout = useRef(-1);
  const refocus = useRef(-1);

  /** The height kept as the cell's minimum, in px (null: none). Compared as a number: the style rounds it. */
  const reserved = useRef<number | null>(null);
  /** Keeps the cell as tall as the tallest item; true when that changed. */
  const reserve = (): boolean => {
    const el = container.current;
    if (!el) return false;
    let height: number | null = null;
    if (live) {
      el.setAttribute('data-measuring', '');
      // fractional heights: a rounded one would move the scene by part of a pixel
      const heights = [...el.querySelectorAll<HTMLElement>(ITEM)].map(
        (item) => item.getBoundingClientRect().height,
      );
      height = Math.max(0, ...heights);
      el.removeAttribute('data-measuring');
    }
    const last = reserved.current;
    if (height === last || (height !== null && last !== null && Math.abs(height - last) < 0.01)) return false;
    reserved.current = height;
    el.style.minHeight = height === null ? '' : `${height}px`;
    return true;
  };

  useLayoutEffect(() => {
    current.current = at;
    playing.current = live;
    const el = container.current;
    if (!el) return;
    for (const body of el.querySelectorAll<HTMLElement>(BODY)) {
      const waiting = live && indexOf(body) !== at;
      if (waiting) body.setAttribute('hidden', 'until-found');
      else body.removeAttribute('hidden');
    }
    if (reserve()) engine.refit();
    // the item that had the focus is now the one in view, under the scene's element for it: the focus follows it
    if (refocus.current === at) {
      refocus.current = -1;
      const lost = el.ownerDocument.activeElement;
      if (!lost || lost === el.ownerDocument.body)
        el.querySelector<HTMLElement>(`${ITEM}[data-index="${at}"]`)?.focus({ preventScroll: true });
    }
  });

  useSceneFrame(scene, (frame) => {
    if (frame.layout === layout.current) return;
    layout.current = frame.layout;
    if (reserve()) engine.refit();
  });

  useEffect(() => {
    const el = container.current;
    if (!el) return;
    const reveal = (event: Event): void => {
      const i = indexOf(event.target);
      if (i < 0 || i === current.current || !playing.current) return;
      if (event.type === 'focusin') refocus.current = i;
      // after the page's own handling of the event (the section's focus handler, the browser scrolling to a match)
      requestAnimationFrame(() => engine.scrollToScene(scene, (i + 0.5) / count));
    };
    el.addEventListener('focusin', reveal);
    el.addEventListener('beforematch', reveal);
    return () => {
      el.removeEventListener('focusin', reveal);
      el.removeEventListener('beforematch', reveal);
    };
  }, [scene, container, count]);
}
