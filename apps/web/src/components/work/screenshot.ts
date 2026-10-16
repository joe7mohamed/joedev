import { getImageProps } from 'next/image';

/**
 * Every project screenshot is 1280 × 800 and is always requested at that width. next.config.ts ends
 * `deviceSizes` at 1280, so the optimised image has exactly one candidate: the hero zoom (a CSS background, which
 * cannot follow an `<img>` srcset) and every `<img>` of the same screenshot share one URL and one download.
 */
export const SHOT = { width: 1280, height: 800 } as const;

/** The optimised URL every `<Image src={image} {...SHOT}>` of this screenshot loads. */
export const shotUrl = (image: string): string => getImageProps({ src: image, alt: '', ...SHOT }).props.src;
