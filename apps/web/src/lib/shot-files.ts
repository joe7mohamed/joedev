/*
 * The project screenshots as files (Pages round, owner decision 2026-10-18). Neither deploy mode runs Next's image
 * server: scripts/screenshots.mjs encodes each public/projects/ screenshot at build time into public/shots/, at the
 * one width next/image ever asks for (next.config.ts ends `deviceSizes` at 1280) and in the two formats the image
 * server used to negotiate, and the custom loader (image-loader.ts) maps next/image's requests to those files.
 * No imports: Node runs this file directly in the build script.
 */

/** Every screenshot is 1280 × 800 and is only ever requested at its own width. */
export const SHOT_WIDTH = 1280;
/** next/image's default quality, the one the page asks for. */
export const SHOT_QUALITY = 75;
/** AVIF first; WebP for the browsers that cannot decode AVIF. */
export const SHOT_FORMATS = ['avif', 'webp'] as const;
export type ShotFormat = (typeof SHOT_FORMATS)[number];
export const SHOT_TYPES: Record<ShotFormat, string> = { avif: 'image/avif', webp: 'image/webp' };

/** The two files of a screenshot, AVIF first. */
export type ShotSources = { avif: string; fallback: string };

/**
 * sharp's settings, exactly those of the image server this replaces (Next 16.4,
 * next/dist/server/image-optimizer/transform.js `optimizeImage`): AVIF at the quality scaled by 50/80 with effort 3,
 * WebP at the quality as given. With the same sharp, the files are the ones it served, byte for byte.
 */
export const ENCODING = {
  avif: { quality: Math.max(Math.round(SHOT_QUALITY * (50 / 80)), 1), effort: 3 },
  webp: { quality: SHOT_QUALITY },
} as const;

/** Where the sources live (public/projects/) and where their encodings go (public/shots/, built, not committed). */
export const SOURCE_DIR = 'projects';
export const OUT_DIR = 'shots';
const SOURCE = /^\/projects\/([a-z0-9]+(?:-[a-z0-9]+)*)\.(?:jpg|jpeg|png)$/;

/** The base name of a screenshot path, or null when the path is no screenshot. */
export const shotName = (src: string): string | null => SOURCE.exec(src)?.[1] ?? null;

/** The file of a screenshot at a width and in a format. Anything that was not built throws, so the build fails. */
export const shotFile = (src: string, width: number, format: ShotFormat): string => {
  const name = shotName(src);
  if (!name)
    throw new Error(`image loader: ${src} is no project screenshot (public/${SOURCE_DIR}/<name>.jpg)`);
  if (width !== SHOT_WIDTH)
    throw new Error(
      `image loader: ${src} was asked at ${width} px; screenshots are built at ${SHOT_WIDTH} px only`,
    );
  return `/${OUT_DIR}/${name}-${width}.${format}`;
};
