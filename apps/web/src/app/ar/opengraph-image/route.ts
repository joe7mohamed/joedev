import { renderCard } from '@/lib/og-card';

/*
 * The Arabic home page's sharing card, at /ar/opengraph-image, beside its page (see app/opengraph-image/route.ts).
 * This folder holds no page: /ar itself is the app/[[...locale]] route.
 */
export const dynamic = 'force-static';

export function GET(): Promise<Response> {
  return renderCard('ar');
}
