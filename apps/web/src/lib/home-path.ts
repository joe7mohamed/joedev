import { DEFAULT_LOCALE, isLocale, type Locale } from '@zakydev/shared/locales';

/**
 * Where each home page lives (owner decision 2026-10-17): English at the plain domain, Arabic at /ar. Both are real
 * routes of the one optional catch-all root segment, app/[[...locale]] (Pages round, owner decision 2026-10-18), so
 * the same files serve `next start` and the static export, with no rewrite. No content import, so client components
 * (the language switch) can use it without zod or the content reaching the browser.
 */
export const homePath = (locale: Locale): string => (locale === DEFAULT_LOCALE ? '/' : `/${locale}`);

/** The `[[...locale]]` segments of a home page: none for English (the root route), one for every other locale. */
export const segmentsOf = (locale: Locale): string[] => (locale === DEFAULT_LOCALE ? [] : [locale]);

/**
 * The locale of a `[[...locale]]` route, or null when the segments name no home page. The default locale has no
 * segment of its own: `/en` is a redirect to `/` (next.config.ts, out/_redirects), never a second English page.
 */
export const localeOf = (segments: string[] | undefined): Locale | null => {
  if (!segments || segments.length === 0) return DEFAULT_LOCALE;
  const [only] = segments;
  if (segments.length !== 1 || only === undefined || only === DEFAULT_LOCALE || !isLocale(only)) return null;
  return only;
};
