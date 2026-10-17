import { DEFAULT_LOCALE, LOCALES } from '@zakydev/shared';
import type { MetadataRoute } from 'next';
import { homeUrl } from '@/lib/site';

const languages = {
  ...Object.fromEntries(LOCALES.map((l) => [l, homeUrl(l)])),
  'x-default': homeUrl(DEFAULT_LOCALE),
};

export default function sitemap(): MetadataRoute.Sitemap {
  return LOCALES.map((locale) => ({ url: homeUrl(locale), alternates: { languages } }));
}
