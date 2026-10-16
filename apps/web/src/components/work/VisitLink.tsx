import type { CSSProperties } from 'react';
import { icons } from '@/components/icons';
import './visit.css';

type VisitLinkProps = { href: string; label: string; style?: CSSProperties };

/** The address as people type it: host and path, without the scheme or a trailing slash. */
export const addressOf = (href: string): string => {
  const url = new URL(href);
  return `${url.host}${url.pathname === '/' ? '' : url.pathname}`;
};

/**
 * The live-site link (spec 5.4): a solid gold button on desktop, a centred row under a hairline on phones (work.css).
 * It opens in a new tab without giving the other site a handle on this one.
 */
export function VisitLink({ href, label, style }: VisitLinkProps) {
  return (
    <a data-visit data-settle href={href} target="_blank" rel="noopener" style={style}>
      <span data-visit-text>
        <small>{label}</small>
        <b dir="ltr" lang="en">
          {addressOf(href)}
        </b>
      </span>
      <span data-visit-arrow aria-hidden="true">
        <icons.Arrow />
      </span>
    </a>
  );
}
