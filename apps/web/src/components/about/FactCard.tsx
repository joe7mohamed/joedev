import type { HomeContent } from '@zakydev/shared';
import { plain } from '@zakydev/shared/text';
import { FactScene } from './fact-scenes';

type About = HomeContent['about'];
type FactCardProps = { fact: About['facts'][number]; labels: About['sceneLabels'] };

/** One of the four About cards (spec 5.6): a small looping scene above a label and one line. */
export function FactCard({ fact, labels }: FactCardProps) {
  return (
    <li data-fact={fact.id}>
      <span data-fact-scene>
        <FactScene id={fact.id} labels={labels} />
      </span>
      <h3 data-fact-label>{fact.label}</h3>
      <p data-fact-body>{plain(fact.body)}</p>
    </li>
  );
}
