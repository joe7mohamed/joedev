import { FULL } from '@/components/Mark';

/** The overlay mark's size without styles; loader.css sizes it to the viewport. */
const SIZE = 170;

const stroke = {
  fill: 'none',
  strokeWidth: FULL.width,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const;

/**
 * What the loading screen shows (Loader): the mark's two halves with the spark between them, and the counter with
 * its track. sequence.ts animates these parts; rendered on the server, so its markup stays out of the page's scripts.
 */
export function LoaderArt() {
  return (
    <>
      <svg viewBox="0 0 64 64" width={SIZE} height={SIZE} aria-hidden="true">
        <g data-half="a">
          <path d={FULL.upper} stroke="var(--ink)" {...stroke} />
        </g>
        <g data-half="b">
          <path d={FULL.lower} stroke="var(--gold)" {...stroke} />
        </g>
        <circle data-spark cx="32" cy="32" r="3" />
      </svg>
      <div data-loader-meter>
        <span data-loader-count dir="ltr">
          <b>00</b>%
        </span>
        <i data-loader-track>
          <u />
        </i>
      </div>
    </>
  );
}
