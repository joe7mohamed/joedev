'use client';

import { type CSSProperties, type ReactNode, type RefObject, useEffect, useRef, useState } from 'react';
import { frozen } from '@/lib/e2e';
import { fixedRect, registerSlot } from '@/motion/gold';
import { loopAt } from '@/motion/math';
import { Swap } from '@/motion/Swap';
import { MOTION_OK, useMedia } from '@/motion/useMedia';
import { useSceneFrame } from '@/motion/useSceneFrame';
import './loop.css';

export type Stage = { name: string; tools: string };
type LoopRingProps = {
  stages: Stage[];
  /** Rendered on the server (About): one icon per stage, and the mark in the centre. */
  icons: ReactNode[];
  mark: ReactNode;
};
/** A frame step longer than this (a stalled tab) does not jump the loop forward. */
const MAX_STEP_MS = 100;

/** Station i sits on the ring, clockwise from the top; its label goes above, right or left of it. */
const placeOf = (i: number, count: number): { style: CSSProperties; side: 'top' | 'right' | 'left' } => {
  const angle = -Math.PI / 2 + (i / count) * Math.PI * 2;
  const x = Math.cos(angle);
  const side = i === 0 ? 'top' : x > 0 ? 'right' : 'left';
  return { style: { '--x': x.toFixed(4), '--y': Math.sin(angle).toFixed(4) } as CSSProperties, side };
};

const draw = (runner: HTMLElement | null, arc: HTMLElement | null, sweep: number | null): void => {
  if (sweep === null) {
    runner?.style.removeProperty('rotate');
    arc?.style.removeProperty('--a');
    return;
  }
  runner?.style.setProperty('rotate', `${(sweep * 360).toFixed(2)}deg`);
  arc?.style.setProperty('--a', Math.max(0, sweep).toFixed(4));
};

/**
 * The loop's clock: it advances only while the About scene is active and the tab is visible, so the frame loop
 * idles otherwise and the loop resumes where it stopped. Every engine frame (scroll, resize, the tab coming back)
 * restarts it if it should run. Without enhanced mode it rests on the first stage.
 */
function useLoop(
  count: number,
  runner: RefObject<HTMLDivElement | null>,
  arc: RefObject<HTMLDivElement | null>,
) {
  const enhanced = useMedia(MOTION_OK);
  const [current, setCurrent] = useState(0);
  const clock = useRef({ elapsed: 0, last: 0, raf: 0 });
  const scene = useRef<HTMLElement | null>(null);

  // E2E `?freeze=1`: it never starts, so it rests on the first stage
  const playing = (): boolean => scene.current?.dataset.state === 'active' && !document.hidden && !frozen();
  const tick = (now: number): void => {
    const c = clock.current;
    if (!playing()) {
      c.raf = 0;
      return;
    }
    c.elapsed += Math.max(0, Math.min(MAX_STEP_MS, now - c.last));
    c.last = now;
    const { index, sweep } = loopAt(c.elapsed / 1000, count);
    draw(runner.current, arc.current, sweep);
    setCurrent(index);
    c.raf = requestAnimationFrame((next) => latest.current(next));
  };
  const latest = useRef(tick);
  latest.current = tick;

  useSceneFrame('about', (f) => {
    scene.current = f.sticky.parentElement;
    const c = clock.current;
    if (c.raf || !enhanced || !playing()) return;
    c.last = performance.now();
    c.raf = requestAnimationFrame((now) => latest.current(now));
  });
  useEffect(() => {
    if (enhanced) return;
    const c = clock.current;
    cancelAnimationFrame(c.raf);
    clock.current = { elapsed: 0, last: 0, raf: 0 };
    draw(runner.current, arc.current, null);
    setCurrent(0);
  }, [enhanced, runner, arc]);
  useEffect(() => () => cancelAnimationFrame(clock.current.raf), []);
  return current;
}

/**
 * The gold element becomes the ring itself: a circle exactly on the ring's box (spec 5.0). The ring does not move
 * inside the pinned scene, so it is measured once per layout (fixedRect), not every frame.
 */
function useRingSlot(slot: RefObject<HTMLDivElement | null>): void {
  useEffect(() => {
    if (!slot.current) return;
    const rect = fixedRect(slot.current);
    return registerSlot('about', (f, layer) => ({ ...rect(f, layer), radius: 0, fill: 0, round: 1 }));
  }, [slot]);
}

/**
 * The A-to-Z loop (spec 5.6): seven stations on the gold ring, a glowing dot travelling from one to the next with a
 * gold arc behind it, and in the centre the mark, the stage name (it flips) and its tools. The drawing is never
 * mirrored. The stations are a list, so every stage and its tools stay readable to assistive technology while the
 * centre, which changes with time, is hidden from it.
 */
export function LoopRing({ stages, icons, mark }: LoopRingProps) {
  const slot = useRef<HTMLDivElement>(null);
  const runner = useRef<HTMLDivElement>(null);
  const arc = useRef<HTMLDivElement>(null);
  const current = useLoop(stages.length, runner, arc);
  useRingSlot(slot);
  const stage = stages[current] as Stage;
  return (
    <div data-loop>
      <div ref={slot} data-slot aria-hidden="true" />
      <div ref={arc} data-arc aria-hidden="true" />
      <div ref={runner} data-runner aria-hidden="true">
        <i />
      </div>
      <ol data-stations>
        {stages.map((s, i) => {
          const place = placeOf(i, stages.length);
          return (
            <li
              key={s.name}
              data-station
              data-index={i}
              data-side={place.side}
              data-current={i === current || undefined}
              data-done={i < current || undefined}
              style={place.style}
            >
              <span data-node aria-hidden="true">
                {icons[i]}
              </span>
              <span data-station-name>{s.name}</span>
              <span className="sr-only" lang="en">
                {` ${s.tools}`}
              </span>
            </li>
          );
        })}
      </ol>
      <span data-loop-mark aria-hidden="true">
        {mark}
      </span>
      <div data-loop-centre aria-hidden="true">
        <p data-stage-name>
          <Swap value={stage.name} />
        </p>
        <p data-stage-tools lang="en" dir="ltr">
          {stage.tools}
        </p>
      </div>
    </div>
  );
}
