/**
 * The locales and their direction. No imports: client components read this module through
 * `@zakydev/shared/locales`, so zod and the content never come with it (spec line 32, the route-JS budget).
 */
export const LOCALES = ['en', 'ar'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'en';

export const isLocale = (value: string): value is Locale => (LOCALES as readonly string[]).includes(value);

export const dirOf = (locale: Locale): 'ltr' | 'rtl' => (locale === 'ar' ? 'rtl' : 'ltr');

/** The first language tag in an Accept-Language header decides. */
export const pickLocale = (acceptLanguage: string | null): Locale => {
  const first = (acceptLanguage ?? '').split(',')[0]?.trim().toLowerCase() ?? '';
  return first.startsWith('ar') ? 'ar' : DEFAULT_LOCALE;
};
