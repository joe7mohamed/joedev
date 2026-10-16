'use client';

import { useEffect, useRef, useState } from 'react';
import { HOLD_MS, stepTyper, type TyperState, textOf } from '@/motion/typer';
import { MOTION_OK, useMedia } from '@/motion/useMedia';

/** The row around the title has faded in by then (hero-intro.css: 1.05 s delay + 0.9 s), on the page clock. */
const ROW_SHOWN_MS = 1950;
/** While paused (tab hidden, hero scrolled away) the title waits in place and checks again this often. */
const PAUSE_MS = 400;

/** The server-rendered first title, fully shown and holding, so hydration never cuts it back to one letter. */
const holdingFirst = (titles: string[]): TyperState => ({
  index: 0,
  shown: (titles[0] ?? '').length,
  phase: 'holding',
});

/**
 * The title typed between the mark's brackets `< … />`, alternating between the titles. Without motion it is
 * the first title, still. Every title sits invisibly in the same grid cell, so the widest one reserves the
 * width and the row never moves while letters come and go. Assistive technology reads the first title only.
 */
export function TypedTitle({ titles, dir }: { titles: string[]; dir: 'ltr' | 'rtl' }) {
  const moving = useMedia(MOTION_OK);
  const [typer, setTyper] = useState<TyperState>(() => holdingFirst(titles));
  const node = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const first = holdingFirst(titles);
    setTyper(first);
    if (!moving || titles.length < 2) return;
    const scene = node.current?.closest<HTMLElement>('[data-scene]');
    // before the engine runs a scene has no state; it counts as active
    const paused = (): boolean => document.hidden || (scene?.dataset.state ?? 'active') !== 'active';
    let timer = 0;
    // each tick shows the next state at once; its delay is how long that state stays
    const tick = (state: TyperState): void => {
      if (paused()) {
        timer = window.setTimeout(() => tick(state), PAUSE_MS);
        return;
      }
      const next = stepTyper(state, titles);
      setTyper(next.state);
      timer = window.setTimeout(() => tick(next.state), next.delay);
    };
    // the first title holds for the usual time once the row is visible
    const hold = Math.max(0, ROW_SHOWN_MS - performance.now()) + HOLD_MS;
    timer = window.setTimeout(() => tick(first), hold);
    return () => window.clearTimeout(timer);
  }, [moving, titles]);
  return (
    <>
      <span className="sr-only">{titles[0]}</span>
      <span ref={node} data-title aria-hidden="true">
        {titles.map((t) => (
          <span key={t} data-sizer>
            {'< '}
            {t}
            {' />'}
          </span>
        ))}
        <span data-title-row>
          <span data-bracket="open">{'<'}</span>
          <span data-typed dir={dir}>
            {textOf(typer, titles)}
          </span>
          <span data-bracket="close">{'/>'}</span>
        </span>
      </span>
    </>
  );
}
