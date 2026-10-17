import { getHome, type Locale } from '@zakydev/shared';
import { homePath } from './home-path';

/** The canonical origin, without a trailing slash: NEXT_PUBLIC_SITE_URL when set, else the confirmed domain. */
export const siteUrl: string = (
  process.env.NEXT_PUBLIC_SITE_URL || `https://${getHome('en').site.domain}`
).replace(/\/+$/, '');

/**
 * The absolute address of a home page: its canonical URL. The root is the bare origin, without its slash, exactly as
 * Next writes the canonical and the alternates (it serialises a root URL as its origin), so the sitemap and the
 * structured data match them byte for byte.
 */
export const homeUrl = (locale: Locale): string => {
  const path = homePath(locale);
  return path === '/' ? siteUrl : `${siteUrl}${path}`;
};
