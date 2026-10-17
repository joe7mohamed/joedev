import type { HomeContent, Locale } from '@zakydev/shared';

/** The display face each locale's page sets its display text in (display.css, the `--stack-display` of globals.css). */
export const displayFace: Record<Locale, 'fraunces' | 'amiri'> = { en: 'fraunces', ar: 'amiri' };

/**
 * Every content string the page sets in the display face, one key per rule that applies `--stack-display`. A face
 * carries only the characters in its subset (subsets.json), so display-text.test.ts checks these strings against it:
 * when copy changes, a character outside the subset fails the test instead of falling silently to the next face.
 * A new rule that sets content in the display face adds its key here.
 */
export const displayStrings = (home: HomeContent): string[] => [
  // hero.css [data-headline]
  ...home.hero.headline.flat().map((word) => word.t),
  // work.css [data-name]
  ...home.projects.map((project) => project.name),
  // process.css [data-step-title]
  ...home.process.steps.map((step) => step.name),
  // about.css [data-about-heading]
  home.about.heading,
  // loop.css [data-stage-name]
  ...home.about.loop.map((stage) => stage.name),
  // contact.css [data-contact-heading] and [data-email]
  home.contact.heading,
  home.contact.email,
  // the not-found pages' heading (font-display)
  '404',
];
