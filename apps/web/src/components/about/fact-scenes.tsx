import type { HomeContent } from '@zakydev/shared';
import { plain } from '@zakydev/shared';
import type { CSSProperties, ReactNode } from 'react';
import './fact-scenes.css';
import './fact-motion.css';

type About = HomeContent['about'];
export type FactId = About['facts'][number]['id'];
type Labels = About['sceneLabels'];

/** Drawings are never mirrored, also on the Arabic page (spec 6.2). */
const LTR: CSSProperties = { direction: 'ltr' };

/**
 * One 200 × 90 looping card scene (prototype app.js FACT_ICONS). Its words are Latin on both pages, so it is marked
 * as English. The loops run only in enhanced mode while the About scene is active (fact-scenes.css); otherwise the
 * scene shows its finished still.
 */
function Frame({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 200 90" style={LTR} lang="en" aria-hidden="true" focusable="false" data-fx>
      {children}
    </svg>
  );
}

/** The hoist: a white band with five points into the red field (the Bahrain flag; spec 3.2). */
const HOIST = 'M58 20H72L80 23.2L72 26.4L80 29.6L72 32.8L80 36L72 39.2L80 42.4L72 45.6L80 48.8L72 52H58Z';

/** Based in: the Bahrain flag rises up its pole and waves; a pin drops with ripples. */
function Place({ labels }: { labels: Labels }) {
  return (
    <Frame>
      <path className="fx-l" strokeDasharray="2 5" d="M8 78Q100 52 192 78M8 62Q100 36 192 62" />
      <ellipse className="fx-ring fx-rip" cx="146" cy="66" rx="7" ry="2.6" />
      <ellipse className="fx-ring fx-rip fx-later" cx="146" cy="66" rx="7" ry="2.6" />
      <g className="fx-pin">
        <path className="fx-g" d="M146 65s11-10 11-20a11 11 0 0 0-22 0c0 10 11 20 11 20z" />
        <circle className="fx-h" cx="146" cy="45" r="4" />
      </g>
      <path className="fx-pole" d="M56 14V80" />
      <circle className="fx-g" cx="56" cy="12" r="2.6" />
      <g className="fx-rise">
        <g className="fx-wave">
          <path fill="#CE1126" d="M58 20H112V52H58Z" />
          <path fill="#fff" d={HOIST} />
        </g>
      </g>
      <text className="fx-t" x="192" y="14" textAnchor="end">
        {labels.coordinates}
      </text>
    </Frame>
  );
}

const TRACE = 'M8 48H58L68 22L82 72L92 36L98 48H136';

/** Day job: a heartbeat trace that resolves into code brackets. */
function Job({ labels }: { labels: Labels }) {
  return (
    <Frame>
      <path className="fx-l" d={TRACE} />
      <path className="fx-s fx-ecg" pathLength={1} d={TRACE} />
      <path className="fx-s fx-code" pathLength={1} d="M160 34l-11 14 11 14M176 34l11 14-11 14" />
      <text className="fx-t" x="8" y="14">
        {plain(labels.healthcare)}
      </text>
    </Frame>
  );
}

const LIGHTS = [22, 36, 50, 64, 78];

/** Track marshal: five start lights come on and go out, the car launches over moving kerbs, a gold flag waves. */
function Marshal({ labels }: { labels: Labels }) {
  return (
    <Frame>
      <rect className="fx-l" x="12" y="7" width="76" height="18" rx="9" />
      {LIGHTS.map((cx, i) => (
        <circle key={cx} className={`fx-lt fx-lt${i + 1}`} cx={cx} cy="16" r="4.6" />
      ))}
      <path className="fx-l" d="M0 76H200" />
      <path className="fx-kerb" d="M0 82H200" />
      <g className="fx-car">
        <path className="fx-spd" d="M-2 62h-14M-4 68h-18" />
        <path className="fx-i" d="M4 74h36l-3-8h-9l-5-6h-9l-3 6H4z" />
        <path className="fx-g" d="M0 62h6v6H0z" />
        <circle className="fx-h2" cx="12" cy="74" r="4" />
        <circle className="fx-h2" cx="33" cy="74" r="4" />
      </g>
      <path className="fx-s fx-staff" d="M170 76V26" />
      <path className="fx-g fx-flag" d="M170 27C179 22 186 32 197 27V46C186 51 179 41 170 46Z" />
      <text className="fx-t" x="192" y="14" textAnchor="end">
        {labels.circuit}
      </text>
    </Frame>
  );
}

/** The TFT board: seven hexes that fill one after another (prototype order and 0.32 s stagger). */
const HEXES = [
  '167.1,47.1 160,51.2 152.9,47.1 152.9,38.9 160,34.8 167.1,38.9',
  '183.5,47.1 176.4,51.2 169.3,47.1 169.3,38.9 176.4,34.8 183.5,38.9',
  '175.3,61.3 168.2,65.4 161.1,61.3 161.1,53.1 168.2,49 175.3,53.1',
  '158.9,61.3 151.8,65.4 144.7,61.3 144.7,53.1 151.8,49 158.9,53.1',
  '150.7,47.1 143.6,51.2 136.5,47.1 136.5,38.9 143.6,34.8 150.7,38.9',
  '158.9,32.9 151.8,37 144.7,32.9 144.7,24.7 151.8,20.6 158.9,24.7',
  '175.3,32.9 168.2,37 161.1,32.9 161.1,24.7 168.2,20.6 175.3,24.7',
];
const HEX_STAGGER_S = 0.32;
const GAME_X = [39, 102, 160];

/** After work: three mini scenes, the game names as plain text only (spec 5.6: no Riot logos, art or fonts). */
function Games({ labels }: { labels: Labels }) {
  return (
    <Frame>
      <rect className="fx-l" x="8" y="10" width="62" height="62" rx="6" />
      <path className="fx-l fx-thin" d="M14 66L64 16M14 66V20Q14 16 18 16H64M14 66H60Q64 66 64 62V16" />
      <circle className="fx-g" cx="14" cy="66" r="3" />
      <circle className="fx-h2 fx-base" cx="64" cy="16" r="3" />
      <circle className="fx-ring fx-ping" cx="42" cy="38" r="5" />
      <circle className="fx-g fx-scout" cx="14" cy="66" r="2.6" />
      <circle className="fx-l" cx="92" cy="54" r="6" />
      <circle className="fx-l" cx="112" cy="30" r="6" />
      <circle className="fx-g fx-hit fx-later" cx="92" cy="54" r="2.6" />
      <circle className="fx-g fx-hit" cx="112" cy="30" r="2.6" />
      <g className="fx-aim">
        <circle className="fx-s fx-scope" cx="92" cy="54" r="10" />
        <path className="fx-s fx-scope" d="M92 39v7M92 62v7M77 54h7M100 54h7" />
      </g>
      {HEXES.map((points, i) => (
        <polygon
          key={points}
          className="fx-hex"
          points={points}
          style={{ animationDelay: `${(i * HEX_STAGGER_S).toFixed(2)}s` }}
        />
      ))}
      {labels.games.map((game, i) => (
        <text key={plain(game)} className="fx-t" x={GAME_X[i]} y="85" textAnchor="middle">
          {plain(game)}
        </text>
      ))}
    </Frame>
  );
}

const SCENES: Record<FactId, (props: { labels: Labels }) => ReactNode> = {
  place: Place,
  job: Job,
  marshal: Marshal,
  games: Games,
};

/** The card scene for one fact. */
export function FactScene({ id, labels }: { id: FactId; labels: Labels }) {
  const Scene = SCENES[id];
  return <Scene labels={labels} />;
}
