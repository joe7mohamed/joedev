import { DEFAULT_LOCALE, type Locale } from '@zakydev/shared/locales';

/**
 * Where each home page lives (owner decision 2026-10-17): English at the plain domain, Arabic at /ar. Internally both
 * stay the `[locale]` route; src/proxy.ts serves `/` from the `en` one. No content import, so client components (the
 * language switch) can use it without zod or the content reaching the browser.
 */
export const homePath = (locale: Locale): string => (locale === DEFAULT_LOCALE ? '/' : `/${locale}`);
