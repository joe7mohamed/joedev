import { icons } from '@/components/icons';

const ICONS = [icons.Pen, icons.Code, icons.Rocket] as const;

/**
 * Design → Build → Launch: three icon circles joined by two lines. In a 5 s loop (hero.css) a gold line runs
 * from one step to the next and the rocket lifts on arrival; without motion it is the still strip.
 */
export function StepStrip({ steps }: { steps: readonly [string, string, string] }) {
  return (
    <ol data-steps>
      {steps.map((step, i) => {
        const Icon = ICONS[i] ?? icons.Pen;
        return (
          <li key={step} data-step>
            <span data-step-icon>
              <Icon />
            </span>
            <span>{step}</span>
          </li>
        );
      })}
    </ol>
  );
}
