import { getImageProps } from 'next/image';
import { preload } from 'react-dom';

/**
 * Every project screenshot is 1280 × 800 and is always requested at that width. next.config.ts ends
 * `deviceSizes` at 1280, so the optimised image has exactly one candidate: the hero zoom (a CSS background, which
 * cannot follow an `<img>` srcset) and every `<img>` of the same screenshot share one URL and one download.
 *
 * Server only: the attributes are worked out here and handed to the client components, which render a plain
 * `<img>` with them, so next/image's client code stays out of the page's scripts (spec line 32, route-JS budget).
 */
export const SHOT = { width: 1280, height: 800 } as const;

/** The `<img>` attributes `<Image src={image} alt={alt} {...SHOT}>` would render. */
export type Shot = ReturnType<typeof getImageProps>['props'];

/** A screenshot's `<img>` attributes; `eager` ones are not lazy-loaded (the one the hero zoom reveals). */
export const shotOf = (image: string, alt: string, eager = false): Shot =>
  getImageProps({ src: image, alt, ...SHOT, preload: eager }).props;

/** Preloads a screenshot from the document head, the way `<Image preload>` does. */
export const preloadShot = (shot: Shot): void => {
  if (shot.src) preload(shot.src, { as: 'image', imageSrcSet: shot.srcSet, imageSizes: shot.sizes });
};

/** The optimised URL every `<img>` of this screenshot loads. */
export const shotUrl = (image: string): string => shotOf(image, '').src;

/** Each project screenshot once, at the URL every image of it loads; projects without one are skipped. */
export const shotUrls = (images: string[]): string[] => [...new Set(images.filter(Boolean).map(shotUrl))];
