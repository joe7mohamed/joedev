import { Geist, Geist_Mono, IBM_Plex_Sans_Arabic } from 'next/font/google';
import '@/fonts/fallbacks.css';

// The body and mono faces. None is preloaded: only the headline's display face is (fonts/display.ts), so the first
// paint waits for nothing else. Each one swaps in over a metric-matched fallback (fonts/fallbacks.css, which also
// covers the Arial look-alikes of Linux), so the swap does not move the text. The variables are named --face-* so
// they never collide with the theme's --font-* stacks. The display faces are self-hosted in fonts/display.css.
// next/font needs each call's options written out in full.
export const body = Geist({
  subsets: ['latin'],
  variable: '--face-body',
  display: 'swap',
  preload: false,
  adjustFontFallback: false,
  fallback: ['Geist Fallback'],
});
export const mono = Geist_Mono({
  subsets: ['latin'],
  variable: '--face-mono',
  display: 'swap',
  preload: false,
  adjustFontFallback: false,
  fallback: ['Geist Mono Fallback'],
});
export const bodyAr = IBM_Plex_Sans_Arabic({
  subsets: ['arabic'],
  weight: ['400', '500', '600'],
  variable: '--face-body-ar',
  display: 'swap',
  preload: false,
  adjustFontFallback: false,
  fallback: ['IBM Plex Sans Arabic Fallback'],
});
