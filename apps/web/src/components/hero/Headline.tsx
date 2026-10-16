import type { HomeContent } from '@zakydev/shared';
import { type CSSProperties, Fragment } from 'react';

type Lines = HomeContent['hero']['headline'];
type Word = Lines[number][number];
type Placed = { word: Word; index: number; firstLetter: number };

type HeadlineProps = {
  lines: Lines;
  /** English builds letter by letter; Arabic is never split into letters (spec 3.3). */
  byLetter: boolean;
  /** The optimised URL of the first project's screenshot (work/screenshot.ts), which fills the zoom word's letters. */
  image: string;
};

const indexed = (i: number): CSSProperties => ({ '--i': i }) as CSSProperties;

/** Each word with its running index and the running index of its first letter (the animation stagger). */
const place = (lines: Lines): Placed[][] => {
  const flat = lines.flat();
  const starts = flat.map((_, i) => flat.slice(0, i).reduce((sum, w) => sum + [...w.t].length, 0));
  const offsets = lines.map((_, li) => lines.slice(0, li).reduce((sum, line) => sum + line.length, 0));
  return lines.map((line, li) =>
    line.map((word, wi) => {
      const index = (offsets[li] ?? 0) + wi;
      return { word, index, firstLetter: starts[index] ?? 0 };
    }),
  );
};

function HeadWord({ word, index, firstLetter, byLetter, image }: Placed & Omit<HeadlineProps, 'lines'>) {
  const style =
    word.key && image
      ? ({ ...indexed(index), '--zoom-shot': `url(${JSON.stringify(image)})` } as CSSProperties)
      : indexed(index);
  return (
    <span
      data-word
      data-key={word.key ? true : undefined}
      data-text={word.key ? word.t : undefined}
      className={word.gold ? 'text-accent' : undefined}
      style={style}
    >
      <span data-ink>
        {byLetter
          ? [...word.t].map((c, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: letters of a fixed word never reorder
              <span key={i} data-ch data-c={c} style={indexed(firstLetter + i)}>
                {c}
              </span>
            ))
          : word.t}
      </span>
      {word.key ? <span data-slot /> : null}
    </span>
  );
}

/**
 * The type-led headline. Every word is a `data-word` span and, in English, every letter a `data-ch` span, all
 * rendered on the server so the load animation never changes the layout. Real space text nodes sit between
 * words and lines, so the heading's text still reads as one sentence; the visible parts are hidden from
 * assistive technology, which reads the full sentence from `aria-label`.
 */
export function Headline({ lines, byLetter, image }: HeadlineProps) {
  const sentence = lines.map((line) => line.map((w) => w.t).join(' ')).join(' ');
  return (
    <h1 aria-label={sentence} data-headline={byLetter ? 'letters' : 'words'}>
      {place(lines).map((line, li) => (
        <span key={line[0]?.index ?? li} data-line aria-hidden="true">
          {li > 0 ? ' ' : null}
          {line.map((p, wi) => (
            <Fragment key={p.index}>
              {wi > 0 ? ' ' : null}
              <HeadWord {...p} byLetter={byLetter} image={image} />
            </Fragment>
          ))}
        </span>
      ))}
    </h1>
  );
}
