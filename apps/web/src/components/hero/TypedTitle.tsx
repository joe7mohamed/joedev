'use client';

import { useEffect, useState } from 'react';
import { initialTyper, stepTyper, type TyperState, textOf } from '@/motion/typer';
import { MOTION_OK, useMedia } from '@/motion/useMedia';

/** Typing starts once the brackets have slid in (prototype `typeRole`). */
const START_MS = 650;

/**
 * The title typed between the mark's brackets `< … />`, alternating between the titles. Without motion it is
 * the first title, still. Every title sits invisibly in the same grid cell, so the widest one reserves the
 * width and the row never moves while letters come and go. Assistive technology reads the first title only.
 */
export function TypedTitle({ titles, dir }: { titles: string[]; dir: 'ltr' | 'rtl' }) {
  const moving = useMedia(MOTION_OK);
  const [typer, setTyper] = useState<TyperState | null>(null);
  useEffect(() => {
    setTyper(null);
    if (!moving || titles.length < 2) return;
    let timer = 0;
    // each tick shows the next state at once; its delay is how long that state stays
    const tick = (state: TyperState): void => {
      const next = stepTyper(state, titles);
      setTyper(next.state);
      timer = window.setTimeout(() => tick(next.state), next.delay);
    };
    timer = window.setTimeout(() => tick(initialTyper), START_MS);
    return () => window.clearTimeout(timer);
  }, [moving, titles]);
  const shown = typer ? textOf(typer, titles) : (titles[0] ?? '');
  return (
    <>
      <span className="sr-only">{titles[0]}</span>
      <span data-title aria-hidden="true">
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
            {shown}
          </span>
          <span data-bracket="close">{'/>'}</span>
        </span>
      </span>
    </>
  );
}
