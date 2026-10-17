import type { Locale } from '@zakydev/shared';
import './display.css';

/**
 * The display face each page's headline is set in, preloaded on that page only, so it is there for the first paint.
 * These are the same files display.css declares (the bundler emits one asset per source file), so the preload is the
 * download the page uses, not a second one.
 */
export const headlineFace: Record<Locale, string> = {
  en: new URL('./fraunces-latin.woff2', import.meta.url).href,
  ar: new URL('./amiri-bold.woff2', import.meta.url).href,
};
