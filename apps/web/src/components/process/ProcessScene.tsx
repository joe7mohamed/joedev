'use client';

import { type HomeContent, plain } from '@zakydev/shared';
import { type RefObject, useEffect, useRef, useState } from 'react';
import type { SceneFrame } from '@/motion/engine';
import { pinnedRect, registerSlot } from '@/motion/gold';
import { clamp, currentFirst, stepAt, stepDraw } from '@/motion/math';
import { MOTION_OK, useMedia } from '@/motion/useMedia';
import { useSceneFrame } from '@/motion/useSceneFrame';
import { BuildScene } from './BuildScene';
import { StepRail } from './StepRail';
import { type Step, StepText } from './StepText';
import './process.css';

type ProcessProps = { content: HomeContent['process'] };
type Progress = { current: number; flowing: boolean };

/** The rail line is 3 px thick and centred on the stations (spec 5.0). */
const LINE = 3;

const pad = (n: number): string => String(n).padStart(2, '0');
const flowingOf = (f: SceneFrame): boolean => f.sticky.parentElement?.hasAttribute('data-unpinned') ?? false;

/**
 * Writes step n's drawing progress as `--pN` on the drawing; `null` removes them, so the drawing falls back to its
 * finished resting state (build-scene.css). Only changed values are written.
 */
const drawingWriter = () => {
  const written: (string | null)[] = [];
  return (svg: SVGSVGElement, body: number | null, count: number): void => {
    for (let n = 0; n < count; n++) {
      const value = body === null ? null : stepDraw(body, n, count).toFixed(3);
      if (written[n] === value) continue;
      written[n] = value;
      if (value === null) svg.style.removeProperty(`--p${n}`);
      else svg.style.setProperty(`--p${n}`, value);
    }
  };
};

/**
 * Follows the scene: which step is current, whether the scene flows because it does not fit (then everything shows,
 * as on the stacked page), and the drawing's progress. With reduced motion the engine stops, so the drawing is
 * reset to its finished state here.
 */
function useProcessStep(
  count: number,
  drawing: RefObject<SVGSVGElement | null>,
  enhanced: boolean,
): Progress {
  const [progress, setProgress] = useState<Progress>({ current: 0, flowing: false });
  const [write] = useState(drawingWriter);
  useSceneFrame('process', (f) => {
    const flowing = flowingOf(f);
    if (drawing.current) write(drawing.current, flowing ? null : f.body, count);
    const { index } = stepAt(f.body, count);
    setProgress((p) => (p.current === index && p.flowing === flowing ? p : { current: index, flowing }));
  });
  useEffect(() => {
    if (!enhanced && drawing.current) write(drawing.current, null, count);
  }, [enhanced, drawing, write, count]);
  return progress;
}

/**
 * The gold element becomes the rail line: anchored on the first station (the right one in Arabic), its length is
 * the progress through the steps, full on the last station. This is a documented live slot (spec 5.0, 6.4): the
 * rail sits below the step text, so its position depends on text height, and it is measured every frame.
 */
function useRailSlot(slot: RefObject<HTMLDivElement | null>, count: number): void {
  useEffect(
    () =>
      registerSlot('process', (f, layer) => {
        const rail = pinnedRect(slot.current as HTMLElement, f.sticky, layer);
        const w = rail.w * clamp((f.body * count) / (count - 1));
        const rtl = document.documentElement.dir === 'rtl';
        return {
          x: rtl ? rail.x + rail.w - w : rail.x,
          y: rail.y - LINE / 2,
          w,
          h: LINE,
          radius: 2,
          // open while the frame shrinks into it, solid once thin (data-thin), as in the prototype
          fill: 0,
          round: 0,
        };
      }),
    [slot, count],
  );
}

/**
 * How I work (spec 5.5): the five steps beside a drawing of an app being built, and a rail of stations below.
 * Without script or with reduced motion every step shows in full, one after another, and the drawing is finished;
 * so does a scene too tall to pin. Otherwise all steps share one grid cell (the tallest decides the height) and
 * only the current one shows; it keeps its element (key `current`), so its name flips instead of being replaced.
 */
export function Process({ content }: ProcessProps) {
  const drawing = useRef<SVGSVGElement>(null);
  const slot = useRef<HTMLDivElement>(null);
  const enhanced = useMedia(MOTION_OK);
  const count = content.steps.length;
  const progress = useProcessStep(count, drawing, enhanced);
  useRailSlot(slot, count);

  const live = enhanced && !progress.flowing;
  const at = live ? progress.current : 0;
  return (
    <div data-fade data-process>
      <div data-process-main>
        <div data-process-scene>
          <BuildScene ref={drawing} live={plain(content.live)} />
        </div>
        <div data-process-text>
          <h2 data-label>{content.label}</h2>
          <p data-count dir="ltr" aria-hidden="true">
            <b>{pad(at + 1)}</b> / {pad(count)}
          </p>
          <ol data-process-steps>
            {currentFirst(count, at).map((i) => (
              <StepText
                key={i === at ? 'current' : i}
                step={content.steps[i] as Step}
                number={i + 1}
                youGet={content.youGet}
                current={i === at}
                hidden={live && i !== at}
              />
            ))}
          </ol>
        </div>
      </div>
      <StepRail names={content.steps.map((step) => step.name)} current={at} slot={slot} />
    </div>
  );
}
