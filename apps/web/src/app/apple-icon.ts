import { ICON_TYPE, renderIcon } from '@/lib/app-icon';

// a static export (npm run build:static) writes it as a file only when it is marked static; it always was
export const dynamic = 'force-static';

/** The iOS home-screen icon (spec 6.7): full bleed, iOS rounds the corners itself. Next links it from every page. */
export const size = { width: 180, height: 180 };
export const contentType = ICON_TYPE;

export default async function AppleIcon() {
  return new Response(await renderIcon(size.width, true), { headers: { 'content-type': ICON_TYPE } });
}
