import type { ImgHTMLAttributes } from 'react';
import { SHOT_TYPES } from '../../lib/shot-files';
import type { Shot } from './screenshot';

/** `alt` is required: the article's description of the screenshot, or empty where the image is decoration. */
type ShotPictureProps = { shot: Shot; alt: string } & Omit<ImgHTMLAttributes<HTMLImageElement>, 'alt'>;

/**
 * A screenshot: the AVIF first, the `<img>` with next/image's attributes (screenshot.ts) as the WebP fallback, and
 * any attribute given here on the `<img>`. The `<picture>` takes no box of its own (frame.css, work.css), so the
 * `<img>` lays out as it would alone.
 */
export function ShotPicture({ shot, alt, ...img }: ShotPictureProps) {
  return (
    <picture>
      <source type={SHOT_TYPES.avif} srcSet={shot.avif} />
      <img {...shot.img} {...img} alt={alt} />
    </picture>
  );
}
