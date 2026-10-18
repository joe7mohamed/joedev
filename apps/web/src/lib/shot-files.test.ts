import { describe, expect, it } from 'vitest';
import imageLoader from './image-loader';
import { ENCODING, SHOT_FORMATS, SHOT_QUALITY, SHOT_WIDTH, shotFile } from './shot-files';

// Pages round: no image server in either mode; the screenshots are files encoded at build time.
describe('shotFile', () => {
  it('names the file of a screenshot at a width and in a format', () => {
    expect(shotFile('/projects/nuammer.jpg', 1280, 'avif')).toBe('/shots/nuammer-1280.avif');
    expect(shotFile('/projects/nuammer.jpg', 1280, 'webp')).toBe('/shots/nuammer-1280.webp');
  });

  it('refuses any image that is no screenshot, and any width that is not built, so the build fails loudly', () => {
    expect(() => shotFile('/brand/favicon.svg', 1280, 'avif')).toThrow(/screenshot/);
    expect(() => shotFile('https://example.com/a.jpg', 1280, 'avif')).toThrow(/screenshot/);
    expect(() => shotFile('/projects/../secret.jpg', 1280, 'avif')).toThrow(/screenshot/);
    expect(() => shotFile('/projects/nuammer.jpg', 640, 'avif')).toThrow(/1280/);
  });
});

describe('the encoding', () => {
  it("is the image server's own (next/dist/server/image-optimizer/transform.js) at next/image's default quality", () => {
    expect(SHOT_WIDTH).toBe(1280);
    expect(SHOT_QUALITY).toBe(75);
    // AVIF: quality scaled by 50/80 to match WebP, effort 3; WebP: the quality as given
    expect(ENCODING.avif).toEqual({ quality: 47, effort: 3 });
    expect(ENCODING.webp).toEqual({ quality: 75 });
    expect(SHOT_FORMATS).toEqual(['avif', 'webp']);
  });
});

describe('imageLoader (next.config.ts images.loaderFile)', () => {
  it('maps (src, width) to the WebP file, the <img> fallback beside the AVIF <source>', () => {
    expect(imageLoader({ src: '/projects/wazifi.jpg', width: 1280, quality: 75 })).toBe(
      '/shots/wazifi-1280.webp',
    );
    expect(imageLoader({ src: '/projects/wazifi.jpg', width: 1280 })).toBe('/shots/wazifi-1280.webp');
  });

  it('refuses a quality the files were not encoded at', () => {
    expect(() => imageLoader({ src: '/projects/wazifi.jpg', width: 1280, quality: 90 })).toThrow(/quality/);
  });
});
