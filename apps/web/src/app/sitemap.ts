import { LOCALES } from '@zakydev/shared';
import type { MetadataRoute } from 'next';
import { siteUrl } from '@/lib/site';

const languages = {
  ...Object.fromEntries(LOCALES.map((l) => [l, `${siteUrl}/${l}`])),
  'x-default': `${siteUrl}/en`,
};

export default function sitemap(): MetadataRoute.Sitemap {
  return LOCALES.map((locale) => ({ url: `${siteUrl}/${locale}`, alternates: { languages } }));
}
