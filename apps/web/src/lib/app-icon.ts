import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { Resvg } from '@resvg/resvg-js';

/**
 * The raster app icons (spec 6.7), rendered at build time from the brand's gold icon (public/brand) with resvg, as
 * the sharing image is. `full` drops the rounded corners: iOS and maskable icons are cut to shape by the system, and
 * the mark already sits inside the maskable safe zone (the central 80 % circle).
 */
const SOURCE = join(process.cwd(), 'public/brand/zakydev-icon-gold.svg');
const CORNER = /rx="[\d.]+"/;

export const ICON_TYPE = 'image/png';

export const renderIcon = async (size: number, full: boolean): Promise<Uint8Array<ArrayBuffer>> => {
  const svg = await readFile(SOURCE, 'utf8');
  if (full && !CORNER.test(svg)) throw new Error('app icon: the brand icon has no rounded corner to remove');
  const art = full ? svg.replace(CORNER, 'rx="0"') : svg;
  const png = new Resvg(art, { fitTo: { mode: 'width', value: size }, font: { loadSystemFonts: false } })
    .render()
    .asPng();
  return new Uint8Array(png);
};

/** The manifest's icons: two sizes for any use, and one full-bleed maskable icon. */
export const APP_ICONS = [
  { file: 'icon-192.png', size: 192, full: false },
  { file: 'icon-512.png', size: 512, full: false },
  { file: 'maskable-512.png', size: 512, full: true, purpose: 'maskable' },
] as const;

export const appIconPath = (file: string): string => `/app-icons/${file}`;
