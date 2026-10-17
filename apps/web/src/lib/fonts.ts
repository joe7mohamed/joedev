import { Geist, Geist_Mono, IBM_Plex_Sans_Arabic } from 'next/font/google';

// The body and mono faces. None is preloaded: only the headline's display face is (fonts/display.ts), so the first
// paint waits for nothing else. Each one swaps in over a fallback that next/font sizes to its metrics
// (adjustFontFallback, on by default), so the swap does not move the text. The variables are named --face-* so they
// never collide with the theme's --font-* stacks. The display faces are self-hosted in fonts/display.css.
export const body = Geist({ subsets: ['latin'], variable: '--face-body', display: 'swap', preload: false });
export const mono = Geist_Mono({
  subsets: ['latin'],
  variable: '--face-mono',
  display: 'swap',
  preload: false,
});
export const bodyAr = IBM_Plex_Sans_Arabic({
  subsets: ['arabic'],
  weight: ['400', '500', '600'],
  variable: '--face-body-ar',
  display: 'swap',
  preload: false,
});
