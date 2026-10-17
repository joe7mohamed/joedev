import { getHome } from '@zakydev/shared';
import type { MetadataRoute } from 'next';

/** The dark page colour (globals.css --bg). */
const GROUND = '#0F0E0C';

export default function manifest(): MetadataRoute.Manifest {
  const { site, seo } = getHome('en');
  return {
    name: site.brand,
    short_name: site.brand,
    description: seo.description,
    start_url: '/',
    theme_color: GROUND,
    background_color: GROUND,
    icons: [
      { src: '/brand/favicon.svg', sizes: 'any', type: 'image/svg+xml' },
      { src: '/brand/zakydev-icon-gold.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' },
    ],
  };
}
