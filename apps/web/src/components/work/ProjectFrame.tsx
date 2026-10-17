'use client';

import { type RefObject, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { engine, type SceneFrame } from '@/motion/engine';
import { smooth, stepAt } from '@/motion/math';
import { FINE_POINTER, MOTION_OK, useMedia } from '@/motion/useMedia';
import { addressOf } from './address';
import type { Project } from './ProjectText';
import type { Shot } from './screenshot';
import './frame.css';

type FrameProps = { projects: Project[]; images: Shot[]; current: number; previous: number };

/**
 * How visible the screenshots inside the gold element are. Only this scene decides (spec 6.4): they fade in over
 * the end of the hero's handoff, stay while work's body plays, fade over the first half of work's tail, and are
 * gone in every other scene, so nothing shows inside the ring or the contact flood.
 */
const shotOpacity = (hero: SceneFrame | undefined, work: SceneFrame, scrollY: number): number => {
  if (scrollY + 1 < work.top) return hero ? smooth((hero.out - 0.6) / 0.4) : 0;
  return 1 - smooth(work.out / 0.5);
};

/** Work is near once the hero's handoff has begun: from then on the frame needs every screenshot. */
const workIsNear = (hero: SceneFrame | undefined, work: SceneFrame, scrollY: number): boolean =>
  (hero?.out ?? 1) > 0 || scrollY + 1 >= work.top;

/**
 * Writes `--shot` on the gold content and drifts the current screenshot from its top to its bottom. Returns whether
 * work is near; it stays true once reached, so the later screenshots load once and never while the hero plays.
 */
function usePaint(
  target: HTMLElement | null,
  shots: RefObject<HTMLDivElement | null>,
  count: number,
): boolean {
  const [near, setNear] = useState(false);
  useEffect(() => {
    if (!target) return;
    return engine.subscribe((frames, scroll) => {
      const work = frames.get('work');
      if (!work) return;
      const hero = frames.get('hero');
      if (workIsNear(hero, work, scroll.y)) setNear(true);
      target.style.setProperty('--shot', shotOpacity(hero, work, scroll.y).toFixed(3));
      const { index, local } = stepAt(work.body, count);
      const image = shots.current?.querySelector<HTMLElement>(`[data-index="${index}"]`);
      if (image) image.style.objectPosition = `50% ${(local * 100).toFixed(1)}%`;
    });
  }, [target, shots, count]);
  return near;
}

/** Desktop with a mouse: the frame tilts toward the pointer (home.css reads --px and --py on the gold layer). */
function usePointerTilt(target: HTMLElement | null): void {
  const fine = useMedia(FINE_POINTER);
  const moving = useMedia(MOTION_OK);
  useEffect(() => {
    const layer = target?.closest<HTMLElement>('[data-gold-layer]');
    if (!layer || !fine || !moving) return;
    const onMove = (event: PointerEvent): void => {
      if (event.pointerType !== 'mouse') return;
      layer.style.setProperty('--px', (event.clientX / window.innerWidth - 0.5).toFixed(3));
      layer.style.setProperty('--py', (event.clientY / window.innerHeight - 0.5).toFixed(3));
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      layer.style.removeProperty('--px');
      layer.style.removeProperty('--py');
    };
  }, [target, fine, moving]);
}

/**
 * The project frame inside the gold element (spec 5.4): a browser bar with the address, and the three screenshots
 * stacked. The current one is uncovered, the previous one stays beneath it, and a new one wipes in from the bottom
 * (frame.css). The first screenshot is the one the hero zoom already loaded; the others are added only once work
 * is near, so they never compete with the hero. It renders into `#gold-content`, which is aria-hidden and never takes pointer events, so the frame
 * holds nothing interactive and its images need no alt text; the articles carry the described screenshots.
 */
export function ProjectFrame({ projects, images, current, previous }: FrameProps) {
  const [target, setTarget] = useState<HTMLElement | null>(null);
  const shots = useRef<HTMLDivElement>(null);
  useEffect(() => setTarget(document.getElementById('gold-content')), []);
  const near = usePaint(target, shots, projects.length);
  usePointerTilt(target);
  const shown = projects[current];
  if (!target || !shown) return null;
  return createPortal(
    <>
      <div data-browser>
        <i />
        <i />
        <i />
        <span dir="ltr" lang="en">
          {addressOf(shown.url)}
        </span>
      </div>
      <div ref={shots} data-shots>
        {projects.map((p, i) =>
          i === 0 || near ? (
            // biome-ignore lint/performance/noImgElement: next/image's attributes, worked out on the server (screenshot.ts)
            <img
              key={p.id}
              {...images[i]}
              alt=""
              loading="eager"
              data-index={i}
              data-on={i === current || undefined}
              data-was={(i === previous && i !== current) || undefined}
            />
          ) : null,
        )}
      </div>
    </>,
    target,
  );
}
