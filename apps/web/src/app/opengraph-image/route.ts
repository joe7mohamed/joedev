import { renderCard } from '@/lib/og-card';

/*
 * The English home page's sharing card, at /opengraph-image: beside its page, the root, since app/[[...locale]] cannot
 * hold it (an optional catch-all must be the last segment) and /en is a redirect. A plain route handler, not the
 * `opengraph-image.tsx` file convention: a convention file at the root would also give the 404 page this card. The
 * page lists it itself, with alt text in its language (lib/og.ts sharingMetadata). Rendered once, at build time.
 */
export const dynamic = 'force-static';

export function GET(): Promise<Response> {
  return renderCard('en');
}
