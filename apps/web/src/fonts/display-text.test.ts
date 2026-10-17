import { readFileSync } from 'node:fs';
import { getHome, LOCALES } from '@zakydev/shared';
import { describe, expect, it } from 'vitest';
import { displayFace, displayStrings } from './display-text';
import subsets from './subsets.json';

/** CSS unicode-range (U+XXXX or U+XXXX-YYYY, comma separated) as inclusive code point intervals. */
const intervals = (range: string): [number, number][] =>
  range.split(',').map((part) => {
    const [low = '', high] = part.trim().slice(2).split('-');
    return [Number.parseInt(low, 16), Number.parseInt(high ?? low, 16)];
  });

/** A string's characters ([...text] splits by code point), so `codePointAt(0)` is always defined. */
const codeOf = (c: string): number => c.codePointAt(0) ?? 0;

const outside = (text: string, range: string): string[] => {
  const ranges = intervals(range);
  return [...new Set([...text].filter((c) => !ranges.some(([a, b]) => codeOf(c) >= a && codeOf(c) <= b)))];
};
const point = (c: string): string => `U+${codeOf(c).toString(16).toUpperCase().padStart(4, '0')} "${c}"`;

describe('display face subsets', () => {
  for (const locale of LOCALES) {
    it(`every display string of ${locale} is inside its face's subset`, () => {
      const face = displayFace[locale];
      const strings = displayStrings(getHome(locale));
      expect(strings.length).toBeGreaterThan(10);
      const missing = outside(strings.join(''), subsets[face].unicodeRange).map(point);
      // add the code points to fonts/subsets.json and run `npm run fonts -w web` (docs/DEPLOY.md, "Display fonts")
      expect(missing, `${face} lacks characters`).toEqual([]);
    });
  }

  it('the stylesheet declares each face with the unicode-range its file was built with', () => {
    const css = readFileSync(new URL('./display.css', import.meta.url), 'utf8');
    for (const { file, unicodeRange } of Object.values(subsets)) {
      const rule = css.match(new RegExp(`@font-face \\{[^}]*${file.replace('.', '\\.')}[^}]*\\}`))?.[0] ?? '';
      expect(rule, file).not.toBe('');
      expect(rule.match(/unicode-range: ([^;]+);/)?.[1], file).toBe(unicodeRange);
    }
  });
});
