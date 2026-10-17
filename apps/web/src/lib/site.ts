import { getHome, type Locale } from '@zakydev/shared';
import { homePath } from './home-path';

/** The canonical origin, without a trailing slash: NEXT_PUBLIC_SITE_URL when set, else the confirmed domain. */
export const siteUrl: string = (
  process.env.NEXT_PUBLIC_SITE_URL || `https://${getHome('en').site.domain}`
).replace(/\/+$/, '');

/** The absolute address of a home page: its canonical URL. */
export const homeUrl = (locale: Locale): string => `${siteUrl}${homePath(locale)}`;
