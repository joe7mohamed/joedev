import { SHOT_QUALITY, shotFile } from './shot-files';

/**
 * next.config.ts `images.loaderFile`, the same in both deploy modes: next/image's (src, width) becomes the WebP file
 * built at that width, the `<img>`'s own source. The AVIF file beside it is offered first by a `<picture>` source
 * (components/work/screenshot.ts). Only the server calls it (getImageProps), so it never reaches a page script.
 */
export default function imageLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}): string {
  if (quality !== undefined && quality !== SHOT_QUALITY)
    throw new Error(
      `image loader: ${src} was asked at quality ${quality}; screenshots are built at ${SHOT_QUALITY}`,
    );
  return shotFile(src, width, 'webp');
}
