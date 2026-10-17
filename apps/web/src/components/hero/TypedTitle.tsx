'use client';

import { type CSSProperties, useEffect, useRef, useState } from 'react';
import { frozen } from '@/lib/e2e';
import { whenLoaded } from '@/motion/loaded';
import { HOLD_MS, stepTyper, type TyperState, textOf } from '@/motion/typer';
import { MOTION_OK, useMedia } from '@/motion/useMedia';
import './typed-title.css';

/**
 * The first title types in by a stepped clip from first paint (hero-intro.css), one step per letter, starting when
 * the row around it fades in, on the page clock: from navigation start, or from the moment the loading screen
 * released the build. Spec 5.3: 48–88 ms per character.
 */
const TYPE_AT_MS = 1050;
const TYPE_STEP_MS = 68;
/** While paused (tab hidden, hero scrolled away) the title waits in place and checks again this often. */
const PAUSE_MS = 400;

/** The server-rendered first title, fully shown and holding, so hydration never cuts it back to one letter. */
const holdingFirst = (titles: string[]): TyperState => ({
  index: 0,
  shown: (titles[0] ?? '').length,
  phase: 'holding',
});

/** The values the type-in reveal reads: one step per letter of the first title. */
const reveal = (first: string): CSSProperties =>
  ({
    '--n': Math.max(1, first.length),
    '--type-at': `${TYPE_AT_MS}ms`,
    '--type-step': `${TYPE_STEP_MS}ms`,
  }) as CSSProperties;

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
    if (!moving || titles.length < 2 || frozen()) return;
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
    // the first title holds for the usual time once it has typed in
    const stopWaiting = whenLoaded((origin) => {
      const typedIn = origin + TYPE_AT_MS + first.shown * TYPE_STEP_MS;
      const hold = Math.max(0, typedIn - performance.now()) + HOLD_MS;
      timer = window.setTimeout(() => tick(first), hold);
    });
    return () => {
      stopWaiting();
      window.clearTimeout(timer);
    };
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
          <span data-typed dir={dir} style={reveal(titles[0] ?? '')}>
            {textOf(typer, titles)}
          </span>
          <span data-bracket="close">{'/>'}</span>
        </span>
      </span>
    </>
  );
}
