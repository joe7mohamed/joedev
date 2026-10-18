import type { HomeContent, Locale } from '@zakydev/shared';
import { homeUrl, siteUrl } from '@/lib/site';
import { profilePageLd, serializeLd } from '@/lib/structured-data';

/**
 * The page's structured data: a ProfilePage at the page's own canonical address, with the person as its main entity.
 * JSON-LD is data, not script, so the CSP does not apply to it.
 */
export function JsonLd({ content, locale }: { content: HomeContent; locale: Locale }) {
  const ld = profilePageLd(content, { locale, pageUrl: homeUrl(locale), siteUrl });
  return (
    <script
      type="application/ld+json"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON from this repo's content, `<` escaped by serializeLd
      dangerouslySetInnerHTML={{ __html: serializeLd(ld) }}
    />
  );
}
