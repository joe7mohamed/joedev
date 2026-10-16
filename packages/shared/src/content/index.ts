import type { Locale } from '../locales';
import { homeAr } from './home.ar';
import { homeEn } from './home.en';
import { type HomeContent, homeContentSchema } from './schema';

export * from './schema';

export const home: Record<Locale, HomeContent> = {
  en: homeContentSchema.parse(homeEn),
  ar: homeContentSchema.parse(homeAr),
};

/** Dotted paths of every text still waiting for the owner's confirmation. */
export const unconfirmedPaths = (content: HomeContent): string[] => {
  const found: string[] = [];
  const walk = (value: unknown, path: string): void => {
    if (Array.isArray(value)) {
      value.forEach((item, i) => {
        walk(item, `${path}[${i}]`);
      });
    } else if (value && typeof value === 'object') {
      if ((value as { unconfirmed?: boolean }).unconfirmed === true) found.push(path);
      else for (const [k, v] of Object.entries(value)) walk(v, path ? `${path}.${k}` : k);
    }
  };
  walk(content, '');
  return found;
};

export const getHome = (locale: Locale, opts: { requireConfirmed?: boolean } = {}): HomeContent => {
  const content = home[locale];
  if (opts.requireConfirmed) {
    const paths = unconfirmedPaths(content);
    if (paths.length > 0) throw new Error(`Unconfirmed content in "${locale}": ${paths.join(', ')}`);
  }
  return content;
};
