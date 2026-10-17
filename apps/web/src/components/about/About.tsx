import type { HomeContent } from '@zakydev/shared';
import { plain } from '@zakydev/shared/text';
import { icons } from '@/components/icons';
import { Mark } from '@/components/Mark';
import { FactCard } from './FactCard';
import { LoopRing } from './LoopRing';
import './about.css';

type AboutProps = { content: HomeContent['about'] };

/** One icon per stage, clockwise from the top (prototype app.js LOOP_ICONS). */
const LOOP_ICONS = [
  icons.Bulb,
  icons.Pen,
  icons.Code,
  icons.Database,
  icons.CheckCircle,
  icons.Rocket,
  icons.Pulse,
];

/**
 * About (spec 5.6): the A-to-Z loop on the gold ring, the heading, four scene cards and the Riot disclaimer.
 * The text comes first in the document; on screen the ring sits on the start side (desktop) or on top (phone).
 * Without script or with reduced motion the ring rests on the first stage and the cards show their finished scenes.
 */
export function About({ content }: AboutProps) {
  const stages = content.loop.map((stage) => ({ name: stage.name, tools: plain(stage.tools) }));
  return (
    <div data-fade data-about>
      <div data-about-text>
        <p data-label>{content.label}</p>
        <h2 data-about-heading>{content.heading}</h2>
        <ul data-facts>
          {content.facts.map((fact) => (
            <FactCard key={fact.id} fact={fact} labels={content.sceneLabels} />
          ))}
        </ul>
        <p data-disclaimer>{content.disclaimer}</p>
      </div>
      <LoopRing
        stages={stages}
        icons={stages.map((stage, i) => {
          const Icon = LOOP_ICONS[i] ?? icons.Pulse;
          return <Icon key={stage.name} />;
        })}
        mark={<Mark size={64} />}
      />
    </div>
  );
}
