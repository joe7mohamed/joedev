import { type HomeContent, type Locale, plain } from '@zakydev/shared';
import { icons } from '@/components/icons';
import { Headline } from './Headline';
import { HeroMotion } from './HeroMotion';
import { RotatingWord } from './RotatingWord';
import { StepStrip } from './StepStrip';
import { TypedTitle } from './TypedTitle';
import './hero.css';
import './hero-intro.css';
import './hero-motion.css';
import '@/components/button.css';

type HeroProps = { content: HomeContent['hero']; projectImage: string; locale: Locale };

/**
 * The first screen (spec 5.3): the title, place and availability in one quiet row, the headline, the sentence
 * with its rotating word and the step strip beside the two actions, and the scroll cue.
 */
export function Hero({ content, projectImage, locale }: HeroProps) {
  const rtl = locale === 'ar';
  return (
    <HeroMotion rtl={rtl} byLetter={!rtl}>
      <ul data-side data-tags>
        <li data-role>
          <TypedTitle titles={content.titles.map(plain)} dir={rtl ? 'rtl' : 'ltr'} />
        </li>
        <li>
          <icons.Pin />
          <span>{content.place}</span>
        </li>
        <li data-open>
          <i data-pulse aria-hidden="true" />
          <span>{plain(content.availability)}</span>
        </li>
      </ul>
      <Headline lines={content.headline} byLetter={!rtl} image={projectImage} />
      <div data-side data-foot>
        <div data-pitch>
          <p data-lead>
            <RotatingWord sentence={content.sentence} words={content.rotating} />
          </p>
          <StepStrip steps={content.steps} />
        </div>
        <div data-actions>
          <a href="#work" data-button="primary">
            {content.primary}
          </a>
          <a href="#contact" data-button>
            {content.secondary}
          </a>
        </div>
      </div>
      <p data-side data-cue aria-hidden="true">
        <i />
        <span>{content.scroll}</span>
      </p>
    </HeroMotion>
  );
}
