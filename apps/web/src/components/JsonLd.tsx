import type { HomeContent } from '@zakydev/shared';
import { personLd, serializeLd } from '@/lib/structured-data';

/**
 * The page's structured data, with `url` the page's own canonical address. JSON-LD is data, not script, so the CSP
 * does not apply to it.
 */
export function JsonLd({ content, url }: { content: HomeContent; url: string }) {
  return (
    <script
      type="application/ld+json"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON from this repo's content, `<` escaped by serializeLd
      dangerouslySetInnerHTML={{ __html: serializeLd(personLd(content, url)) }}
    />
  );
}
