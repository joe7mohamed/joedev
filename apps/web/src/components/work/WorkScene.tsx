'use client';

import type { HomeContent } from '@zakydev/shared';
import { type ReactNode, type RefObject, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { pinnedRect, registerSlot } from '@/motion/gold';
import { currentFirst, stepAt } from '@/motion/math';
import { MOTION_OK, useMedia } from '@/motion/useMedia';
import { useSceneFrame } from '@/motion/useSceneFrame';
import { ProjectBars } from './ProjectBars';
import { ProjectFrame } from './ProjectFrame';
import { type Project, ProjectText } from './ProjectText';
import type { Shot } from './screenshot';
import './work.css';

type WorkSceneProps = {
  work: HomeContent['work'];
  projects: Project[];
  /** Per project, in the same order: the article below its name (ProjectBody) and the screenshot (screenshot.ts). */
  bodies: ReactNode[];
  shots: Shot[];
};
type Step = { current: number; previous: number; flowing: boolean };

const noop = (): (() => void) => () => undefined;
/** False on the server and while hydrating, true after: client-only markup cannot cause a hydration mismatch. */
const useHydrated = (): boolean =>
  useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );

const pad = (n: number): string => String(n).padStart(2, '0');

/** Bar n is full once passed, follows the progress while current, and is empty ahead. Unchanged bars are skipped. */
const writeSegments = (root: HTMLElement, count: number, index: number, local: number): void => {
  for (let n = 0; n < count; n++) {
    const fill = (n < index ? 1 : n === index ? local : 0).toFixed(3);
    if (root.style.getPropertyValue(`--seg${n}`) !== fill) root.style.setProperty(`--seg${n}`, fill);
  }
};

/**
 * Follows the scene: which project is current (and which was before it), whether the scene flows because it does
 * not fit (spec 6.4: then everything shows, as on the stacked page), and the bar fills.
 */
function useWorkStep(count: number, root: RefObject<HTMLDivElement | null>): Step {
  const [step, setStep] = useState<Step>({ current: 0, previous: -1, flowing: false });
  useSceneFrame('work', (f) => {
    const { index, local } = stepAt(f.body, count);
    const flowing = f.sticky.parentElement?.hasAttribute('data-unpinned') ?? false;
    if (root.current) writeSegments(root.current, count, index, local);
    setStep((s) =>
      s.current === index && s.flowing === flowing
        ? s
        : { current: index, previous: s.current === index ? s.previous : s.current, flowing },
    );
  });
  return step;
}

/** The gold element becomes the project frame on this slot. No ancestor of the slot is transformed, so it is true. */
function useWorkSlot(slot: RefObject<HTMLDivElement | null>): void {
  useEffect(
    () =>
      registerSlot('work', (f, layer) => ({
        ...pinnedRect(slot.current as HTMLElement, f.sticky, layer),
        radius: 14,
        fill: 0,
        round: 0,
        tilt: 1,
      })),
    [slot],
  );
}

/**
 * The work scene (spec 5.4): one project per third of the scene's body. The text column holds the label and
 * counter, the progress bars and the projects as articles; the other column is the slot the gold element turns
 * into the project frame. Without script or with reduced motion every article shows in full, one after another.
 * So does a scene too tall to pin. Otherwise only the current one shows, and the one that is current keeps its
 * element (key `current`), so its name flips instead of being replaced.
 */
export function WorkScene({ work, projects, bodies, shots }: WorkSceneProps) {
  const root = useRef<HTMLDivElement>(null);
  const slot = useRef<HTMLDivElement>(null);
  const enhanced = useMedia(MOTION_OK);
  const hydrated = useHydrated();
  const count = projects.length;
  const step = useWorkStep(count, root);
  useWorkSlot(slot);

  const live = enhanced && !step.flowing;
  const at = live ? step.current : 0;
  return (
    <div ref={root} data-fade data-work data-project={at}>
      <div data-work-text>
        <div data-work-head>
          <h2 data-label>{work.label}</h2>
          <p data-count dir="ltr" aria-hidden="true">
            <b>{pad(at + 1)}</b> / {pad(count)}
          </p>
        </div>
        <ProjectBars names={projects.map((p) => p.name)} current={at} />
        <div data-projects>
          {/* the current project's article first; the stacked layout (at 0) keeps the order as written */}
          {currentFirst(count, at).map((i) => {
            const project = projects[i] as Project;
            return (
              <ProjectText
                key={i === at ? 'current' : project.id}
                project={project}
                body={bodies[i]}
                shot={shots[i] as Shot}
                current={i === at}
                hidden={live && i !== at}
                preload={i === 0}
                stacked={hydrated && !live}
              />
            );
          })}
        </div>
      </div>
      <div ref={slot} data-slot data-frame aria-hidden="true" />
      <ProjectFrame projects={projects} images={shots} current={at} previous={step.previous} />
    </div>
  );
}
