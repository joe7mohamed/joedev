import type { CSSProperties } from 'react';
import { engine } from '@/motion/engine';
import './bars.css';

type ProjectBarsProps = { names: string[]; current: number };

/**
 * Story-style progress bars, one real button per project (spec 5.4). Each fill reads `--seg<n>`, which Work writes
 * every frame: full once passed, the progress through the segment while current, empty ahead. A press scrolls to
 * the middle of that project's segment. Always left to right, like the drawings.
 */
export function ProjectBars({ names, current }: ProjectBarsProps) {
  return (
    <div data-bars dir="ltr">
      {names.map((name, i) => (
        <button
          key={name}
          type="button"
          aria-label={name}
          aria-pressed={i === current}
          onClick={() => engine.scrollToScene('work', (i + 0.5) / names.length)}
        >
          <i style={{ '--f': `var(--seg${i}, 0)` } as CSSProperties} />
        </button>
      ))}
    </div>
  );
}
