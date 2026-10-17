import type { HomeContent } from '@zakydev/shared';
import { siteUrl } from '@/lib/site';
import { personLd, serializeLd } from '@/lib/structured-data';

/** The page's structured data. JSON-LD is data, not script, so the CSP does not apply to it. */
export function JsonLd({ content }: { content: HomeContent }) {
  return (
    <script
      type="application/ld+json"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON from this repo's content, `<` escaped by serializeLd
      dangerouslySetInnerHTML={{ __html: serializeLd(personLd(content, siteUrl)) }}
    />
  );
}
