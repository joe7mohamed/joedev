import { getImageProps } from 'next/image';
import type { CSSProperties } from 'react';
import { preload } from 'react-dom';
import imageLoader from '../../lib/image-loader';
import { SHOT_TYPES, SHOT_WIDTH, type ShotSources, shotFile } from '../../lib/shot-files';

/**
 * Every project screenshot is 1280 × 800 and is always requested at that width. There is no image server in either
 * deploy mode (Pages round): each screenshot is two files built ahead (lib/shot-files.ts), an AVIF and a WebP for the
 * browsers that cannot decode AVIF. next.config.ts ends `deviceSizes` at 1280, so next/image offers exactly one
 * candidate, and the hero zoom (a CSS background, which cannot follow an `<img>` srcset), the loader and every
 * `<picture>` of the same screenshot pick the same file: one download.
 *
 * Server only: the attributes are worked out here and handed to the client components, which render a plain
 * `<picture>` with them, so next/image's client code stays out of the page's scripts (spec line 32, route-JS budget).
 */
export const SHOT = { width: SHOT_WIDTH, height: 800 } as const;

/** The `<img>` attributes `<Image src={image} alt={alt} {...SHOT}>` would render. */
export type ShotImg = ReturnType<typeof getImageProps>['props'];
/** A screenshot's `<picture>`: the AVIF `<source>` and the `<img>` (ShotPicture.tsx). */
export type Shot = { img: ShotImg; avif: string };

/** A screenshot's `<picture>`; `eager` ones are not lazy-loaded (the one the hero zoom reveals). */
export const shotOf = (image: string, alt: string, eager = false): Shot => ({
  // the loader is named here as well as in next.config.ts, so the attributes never depend on the bundler's alias
  img: getImageProps({ src: image, alt, ...SHOT, preload: eager, loader: imageLoader }).props,
  avif: shotFile(image, SHOT_WIDTH, 'avif'),
});

/**
 * Preloads a screenshot from the document head, as `<Image preload>` does. Only the AVIF: the `type` keeps every
 * browser that cannot decode it from fetching it, and a second preload of the WebP would be fetched by all the others.
 */
export const preloadShot = (shot: Shot): void => {
  preload(shot.avif, { as: 'image', type: SHOT_TYPES.avif });
};

/** The two files every image of this screenshot loads. */
export const shotSources = (image: string): ShotSources => ({
  avif: shotFile(image, SHOT_WIDTH, 'avif'),
  fallback: imageLoader({ src: image, width: SHOT_WIDTH }),
});

/** Each project screenshot once; projects without one are skipped. */
export const shotSourcesOf = (images: string[]): ShotSources[] =>
  [...new Set(images.filter(Boolean))].map(shotSources);

/**
 * The hero zoom's fill (hero-motion.css): the WebP everywhere, and where `image-set()` can choose by type, the AVIF
 * first. A browser that reads image-set() but cannot decode AVIF takes the WebP from the same set.
 */
export const zoomFill = ({
  avif,
  fallback,
}: ShotSources): Record<'--zoom-shot' | '--zoom-set', string> & CSSProperties => ({
  '--zoom-shot': `url(${JSON.stringify(fallback)})`,
  '--zoom-set': `image-set(url(${JSON.stringify(avif)}) type("${SHOT_TYPES.avif}"), url(${JSON.stringify(fallback)}) type("${SHOT_TYPES.webp}"))`,
});
