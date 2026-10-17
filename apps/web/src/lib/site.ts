import { getHome } from '@zakydev/shared';

/** The canonical origin, without a trailing slash: NEXT_PUBLIC_SITE_URL when set, else the confirmed domain. */
export const siteUrl: string = (
  process.env.NEXT_PUBLIC_SITE_URL || `https://${getHome('en').site.domain}`
).replace(/\/+$/, '');
