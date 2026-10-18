import { DEFAULT_LOCALE, LOCALES } from '@zakydev/shared';
import type { MetadataRoute } from 'next';
import { homeUrl } from '@/lib/site';

// a static export (npm run build:static) writes it as a file only when it is marked static; it always was
export const dynamic = 'force-static';

const languages = {
  ...Object.fromEntries(LOCALES.map((l) => [l, homeUrl(l)])),
  'x-default': homeUrl(DEFAULT_LOCALE),
};

export default function sitemap(): MetadataRoute.Sitemap {
  return LOCALES.map((locale) => ({ url: homeUrl(locale), alternates: { languages } }));
}
