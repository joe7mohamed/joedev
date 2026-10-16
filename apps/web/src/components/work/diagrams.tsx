import type { HomeContent } from '@zakydev/shared';
import type { CSSProperties, ReactNode } from 'react';
import './diagrams.css';

type Kind = HomeContent['projects'][number]['diagram'];
type Labels = readonly string[];

/** Drawings are never mirrored, also on the Arabic page (spec 6.2). */
const LTR: CSSProperties = { direction: 'ltr' };

/** One looping "how it works" drawing (prototype app.js SIGS). The loops run only under html.enhanced (diagrams.css). */
function Frame({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 260 64" style={LTR} aria-hidden="true" focusable="false" data-sig>
      {children}
    </svg>
  );
}

/** Nuammer: a request travels Next.js → NestJS → MySQL and back. */
function RequestPath({ labels }: { labels: Labels }) {
  const x = [32, 130, 228];
  return (
    <Frame>
      <path data-sg="line" d="M32 32H228" />
      {x.map((cx) => (
        <circle key={cx} data-sg="node" cx={cx} cy="32" r="9" />
      ))}
      <circle data-sg="dot run" cx="32" cy="32" r="5" />
      {x.map((cx, i) => (
        <text key={cx} data-sg="label" x={cx} y="60" textAnchor="middle">
          {labels[i]}
        </text>
      ))}
    </Frame>
  );
}

/** Wazifi: the request tries provider A, which fails, and provider B answers. */
function ProviderFallback({ labels }: { labels: Labels }) {
  return (
    <Frame>
      <path data-sg="line" d="M32 32C80 32 90 14 152 14M32 32C80 32 90 50 152 50" />
      <circle data-sg="node" cx="32" cy="32" r="9" />
      <circle data-sg="node" cx="152" cy="14" r="9" />
      <path data-sg="cross" d="M146 8l12 12M158 8l-12 12" />
      <circle data-sg="node ok" cx="152" cy="50" r="9" />
      <circle data-sg="dot try" cx="32" cy="32" r="5" />
      <text data-sg="label" x="32" y="60" textAnchor="middle">
        {labels[0]}
      </text>
      <text data-sg="label" x="170" y="18">
        {labels[1]}
      </text>
      <text data-sg="label" x="170" y="54">
        {labels[2]}
      </text>
    </Frame>
  );
}

/** Talmeeha: the server pulses and the four players light up together. */
function ServerSync({ labels }: { labels: Labels }) {
  const players = [
    [40, 12],
    [40, 52],
    [220, 12],
    [220, 52],
  ];
  return (
    <Frame>
      <path data-sg="line" d="M130 32L40 12M130 32L40 52M130 32L220 12M130 32L220 52" />
      <circle data-sg="pulse" cx="130" cy="32" r="8" />
      <circle data-sg="dot" cx="130" cy="32" r="8" />
      {players.map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} data-sg="node player" cx={cx} cy={cy} r="7" />
      ))}
      <text data-sg="label" x="130" y="62" textAnchor="middle">
        {labels[0]}
      </text>
    </Frame>
  );
}

const DRAWINGS: Record<Kind, (props: { labels: Labels }) => ReactNode> = {
  'request-path': RequestPath,
  'provider-fallback': ProviderFallback,
  'server-sync': ServerSync,
};

export function Diagram({ kind, labels }: { kind: Kind; labels: Labels }) {
  const Drawing = DRAWINGS[kind];
  return <Drawing labels={labels} />;
}
