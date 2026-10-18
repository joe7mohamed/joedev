import { getHome, LOCALES, type Locale } from '@zakydev/shared';
import type { Metadata } from 'next';
import { homePath } from './home-path';

/** The sharing card (lib/og-card.tsx). */
export const OG_SIZE = { width: 1200, height: 630 } as const;
export const OG_TYPE = 'image/png';

/**
 * Where each card is served, without a redirect: beside its page, so English at the root (app/opengraph-image/route.ts)
 * and Arabic under /ar (app/ar/opengraph-image/route.ts).
 */
export const ogImagePath = (locale: Locale): string =>
  `${homePath(locale) === '/' ? '' : homePath(locale)}/opengraph-image`;

/** Open Graph wants language_TERRITORY. */
const OG_LOCALE: Record<Locale, string> = { en: 'en_US', ar: 'ar_BH' };

/**
 * The home page's sharing metadata. The card is listed here, not left to Next, so its alt text is in the page's
 * language (a module-level `alt` in opengraph-image.tsx is one string for every locale). Next only adds the file's
 * own entry when the page lists no images.
 */
export const sharingMetadata = (locale: Locale): Metadata => {
  const { seo, site, hero } = getHome(locale);
  // the card shows the headline and nothing else to read, so the headline is its alt text
  const alt = hero.headline
    .flat()
    .map((w) => w.t)
    .join(' ');
  const card = { url: ogImagePath(locale), ...OG_SIZE, type: OG_TYPE, alt };
  return {
    openGraph: {
      type: 'website',
      url: homePath(locale),
      siteName: site.brand,
      title: seo.title,
      description: seo.description,
      locale: OG_LOCALE[locale],
      alternateLocale: LOCALES.filter((l) => l !== locale).map((l) => OG_LOCALE[l]),
      images: [card],
    },
    twitter: { card: 'summary_large_image', title: seo.title, description: seo.description, images: [card] },
  };
};
