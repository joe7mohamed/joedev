import type { HomeContent, Locale } from '@zakydev/shared';
import { plain } from '@zakydev/shared/text';
import { MixedText } from '@/components/MixedText';
import { FactScene } from './fact-scenes';

type About = HomeContent['about'];
type FactCardProps = { fact: About['facts'][number]; labels: About['sceneLabels']; locale: Locale };

/**
 * One of the four About cards (spec 5.6): a small looping scene above a label and one line, whose Latin runs are marked
 * as English on the Arabic page.
 */
export function FactCard({ fact, labels, locale }: FactCardProps) {
  return (
    <li data-fact={fact.id}>
      <span data-fact-scene>
        <FactScene id={fact.id} labels={labels} />
      </span>
      <h3 data-fact-label>{fact.label}</h3>
      <p data-fact-body>
        <MixedText text={plain(fact.body)} locale={locale} />
      </p>
    </li>
  );
}
