import type { Ref } from 'react';
import { icons } from '@/components/icons';
import { engine } from '@/motion/engine';
import './rail.css';

type StepRailProps = {
  names: string[];
  current: number;
  /** The gold element's slot: a zero-height line from the first station's centre to the last one's. */
  slot: Ref<HTMLDivElement>;
};

const stateOf = (i: number, current: number): string | undefined =>
  i < current ? 'done' : i === current ? 'current' : undefined;

/**
 * Five numbered stations joined by the gold line, which is the gold element itself (spec 5.5). Passed stations fill
 * gold with a tick; the current one grows with a pulsing halo. Each station is a real button named by its step that
 * scrolls to the middle of that step. Phones show only the current name; the others stay readable to assistive
 * technology.
 */
export function StepRail({ names, current, slot }: StepRailProps) {
  return (
    <div data-rail>
      <div ref={slot} data-slot data-rail-line aria-hidden="true" />
      <ol data-stations>
        {names.map((name, i) => (
          <li key={name} className={stateOf(i, current)}>
            <button
              type="button"
              aria-current={i === current ? 'step' : undefined}
              onClick={() => engine.scrollToScene('process', (i + 0.5) / names.length)}
            >
              <span data-station aria-hidden="true">
                <b>{i + 1}</b>
                <icons.Tick />
              </span>
              <span data-station-name>{name}</span>
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}
