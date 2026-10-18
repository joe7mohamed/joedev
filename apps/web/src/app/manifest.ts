import { getHome } from '@zakydev/shared';
import type { MetadataRoute } from 'next';
import { APP_ICONS, appIconPath, ICON_TYPE } from '@/lib/app-icon';

// a static export (npm run build:static) writes it as a file only when it is marked static; it always was
export const dynamic = 'force-static';

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
      // raster icons for home screens that do not take SVG
      ...APP_ICONS.map((icon) => ({
        src: appIconPath(icon.file),
        sizes: `${icon.size}x${icon.size}`,
        type: ICON_TYPE,
        ...('purpose' in icon ? { purpose: icon.purpose } : {}),
      })),
    ],
  };
}
