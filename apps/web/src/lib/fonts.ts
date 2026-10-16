import { Amiri, Fraunces, Geist, Geist_Mono, IBM_Plex_Sans_Arabic } from 'next/font/google';

// The variables are named --face-* so they never collide with the theme's --font-* stacks.
export const display = Fraunces({
  subsets: ['latin'],
  axes: ['SOFT', 'opsz'],
  variable: '--face-display',
  display: 'swap',
});
export const body = Geist({ subsets: ['latin'], variable: '--face-body', display: 'swap' });
export const mono = Geist_Mono({ subsets: ['latin'], variable: '--face-mono', display: 'swap' });
export const displayAr = Amiri({
  subsets: ['arabic'],
  weight: ['400', '700'],
  variable: '--face-display-ar',
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
