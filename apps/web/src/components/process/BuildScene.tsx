import type { CSSProperties, Ref } from 'react';
import './build-scene.css';

/** Drawings are never mirrored, also on the Arabic page (spec 6.2). */
const LTR: CSSProperties = { direction: 'ltr' };

type BuildSceneProps = {
  /** Receives `--p0…--p4` from Process every frame while the scene plays. */
  ref?: Ref<SVGSVGElement>;
  /** The badge text once the app is live (content, `process.live`). */
  live: string;
};

/**
 * One app being built over the five steps (spec 5.5), transcribed from the prototype (index.html lines 74–105).
 * Classes `dN` draw their stroke and `oN` fade in with step N's progress `--pN` (build-scene.css); every `--pN`
 * rests at 1, so without the scene playing the drawing is finished. Never mirrored, also on the Arabic page.
 */
export function BuildScene({ ref, live }: BuildSceneProps) {
  return (
    <svg ref={ref} viewBox="0 0 520 400" style={LTR} data-build aria-hidden="true" focusable="false">
      <g className="lift">
        <g className="talk">
          <path
            className="sc d0"
            pathLength={1}
            d="M34 96h70a10 10 0 0 1 10 10v26a10 10 0 0 1-10 10H66l-14 13v-13H34a10 10 0 0 1-10-10v-26a10 10 0 0 1 10-10z"
          />
          <path
            className="sc gd d0"
            pathLength={1}
            style={{ strokeWidth: 5 }}
            d="M56 119h.1M69 119h.1M82 119h.1"
          />
          <path
            className="sc d0"
            pathLength={1}
            d="M436 150h56a10 10 0 0 1 10 10v22a10 10 0 0 1-10 10h-8v12l-13-12h-25a10 10 0 0 1-10-10v-22a10 10 0 0 1 10-10z"
          />
          <path className="sc gd d0" pathLength={1} d="M448 166h32M448 177h20" />
        </g>
        <rect className="sc ghost" x="120" y="50" width="300" height="220" rx="12" />
        <rect className="fi o2" x="140" y="92" width="170" height="68" rx="6" />
        <rect className="fg2 o2" x="322" y="92" width="78" height="68" rx="6" />
        <rect className="fi o2" x="140" y="174" width="80" height="76" rx="6" />
        <rect className="fi o2" x="230" y="174" width="80" height="76" rx="6" />
        <rect className="fi o2" x="320" y="174" width="80" height="76" rx="6" />
        <rect className="fg o2" x="152" y="134" width="56" height="16" rx="8" />
        <rect className="sc d1" pathLength={1} x="120" y="50" width="300" height="220" rx="12" />
        <path className="sc d1" pathLength={1} d="M120 76H420" />
        <circle className="dotc o1" cx="136" cy="63" r="3.5" />
        <rect className="sc d1" pathLength={1} x="140" y="92" width="170" height="68" rx="6" />
        <path className="sc d1" pathLength={1} d="M152 108h92M152 120h60" />
        <rect className="sc d1" pathLength={1} x="152" y="134" width="56" height="16" rx="8" />
        <rect className="sc d1" pathLength={1} x="322" y="92" width="78" height="68" rx="6" />
        <rect className="sc d1" pathLength={1} x="140" y="174" width="80" height="76" rx="6" />
        <rect className="sc d1" pathLength={1} x="230" y="174" width="80" height="76" rx="6" />
        <rect className="sc d1" pathLength={1} x="320" y="174" width="80" height="76" rx="6" />
        <path className="sc d2" pathLength={1} d="M270 270V298M270 298H200V314M270 298H340V312" />
        <circle className="sc d2" pathLength={1} cx="200" cy="332" r="18" />
        <path className="sc gd d2" pathLength={1} d="M194 326l-6 6 6 6M206 326l6 6-6 6" />
        <ellipse className="sc d2" pathLength={1} cx="340" cy="320" rx="24" ry="8" />
        <path className="sc d2" pathLength={1} d="M316 320v24a24 8 0 0 0 48 0v-24" />
        <path className="sc d2" pathLength={1} d="M218 332H316" />
        <circle className="pk o2" cx="218" cy="332" r="4.5" />
        <path className="sc ck d3" pathLength={1} d="M199 236l5 5 9-10" />
        <path className="sc ck d3" pathLength={1} d="M289 236l5 5 9-10" />
        <path className="sc ck d3" pathLength={1} d="M379 236l5 5 9-10" />
        <path className="sc ck d3" pathLength={1} d="M286 104l5 5 9-10" />
        <path className="ptr o3" d="M214 144v19l5-4 3.500 8 4-2-3.500-8h7.500z" />
        <g className="o4">
          <rect className="fg" x="350" y="33" width="80" height="30" rx="15" />
          <circle className="ld" cx="367" cy="48" r="4" />
          <text className="lt" x="378" y="53" lang="en">
            {live}
          </text>
        </g>
      </g>
      <g className="o4">
        <circle className="ring" cx="270" cy="160" r="170" />
        <circle className="ring r2" cx="270" cy="160" r="170" />
      </g>
      <path className="sc gd d4" pathLength={1} d="M60 384H210l10-18 12 34 10-24 8 8H460" />
    </svg>
  );
}
