import type { HomeContent } from '@zakydev/shared';
import { plain } from '@zakydev/shared/text';
import { type CSSProperties, Fragment, type ReactNode } from 'react';
import { Swap } from '@/motion/Swap';

export type Step = HomeContent['process']['steps'][number];

type StepTextProps = {
  step: Step;
  /** Its position in the process (1–5), which keys its settle-in; its place in the scene is one less. */
  number: number;
  youGet: string;
  /** The tick before what the client gets, and the step's tool list (StepTools), both rendered on the server. */
  check: ReactNode;
  tools: ReactNode;
  /** The step in view; in the stacked layout simply the first one. Only it carries the test hooks. */
  current: boolean;
};

/** Position in the settle-in stagger (home.css). */
const settle = (i: number): CSSProperties => ({ '--i': i }) as CSSProperties;

/**
 * One step of the process as a list item: name, sentence, what the client gets and, from step 3 on, the tools.
 * The name flips through `Swap` while the item stays current; the rest is keyed by the step, so a new step remounts
 * it and replays the settle-in, which only fills backwards and so always ends on the visible resting style. The
 * others stay in the accessibility tree by name and sentence, out of sight, with the rest waiting to be found
 * (`data-item-body`, useHiddenItems). The item takes focus only from script (tabIndex -1), so focusing it can bring
 * it into view without adding a tab stop.
 */
export function StepText({ step, number, youGet, check, tools, current }: StepTextProps) {
  return (
    <li
      value={number}
      data-process-step={number}
      data-item
      data-index={number - 1}
      data-current={current || undefined}
      tabIndex={-1}
    >
      <h3 data-step-title data-step-name={current || undefined}>
        <Swap value={step.name} />
      </h3>
      <Fragment key={number}>
        <p data-step-sentence data-settle style={settle(0)}>
          {step.sentence}
        </p>
        <div data-item-body>
          <p data-step-get data-gives={current || undefined} data-settle style={settle(1)}>
            {check}
            <span>
              <small>{youGet}</small>
              {plain(step.gives)}
            </span>
          </p>
          {tools}
        </div>
      </Fragment>
    </li>
  );
}
