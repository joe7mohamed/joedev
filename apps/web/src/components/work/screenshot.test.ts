import { imageConfigDefault } from 'next/dist/shared/lib/image-config';
import { beforeAll, describe, expect, it } from 'vitest';
import config from '../../../next.config';

type Module = typeof import('./screenshot');
let shot: Module;

const AVIF = '/shots/a-1280.avif';
const WEBP = '/shots/a-1280.webp';

beforeAll(async () => {
  // Next's bundler inlines the image options and the custom loader into next/image; here they are given the same
  // way (a plain process.env keeps the options an object instead of coercing them to a string), before it first loads.
  process.env = { ...process.env, __NEXT_IMAGE_OPTS: { ...imageConfigDefault, ...config.images } as never };
  shot = await import('./screenshot');
});

describe('shotOf', () => {
  it('gives the <img> the WebP file, the only srcset candidate next/image offers, and the <picture> the AVIF', () => {
    const { img, avif } = shot.shotOf('/projects/a.png', 'A home page', false);
    expect(img.src).toBe(WEBP);
    expect(img.srcSet?.split(', ').map((c) => c.split(' ')[0])).toEqual([WEBP]);
    expect(avif).toBe(AVIF);
  });

  it('gives the <img> attributes next/image would render, lazy unless eager, and no image-server URL', () => {
    const lazy = shot.shotOf('/projects/a.png', 'A home page', false);
    expect(lazy.img).toMatchObject({ alt: 'A home page', width: 1280, height: 800, loading: 'lazy' });
    expect(JSON.stringify(lazy)).not.toContain('/_next/image');
    expect(shot.shotOf('/projects/a.png', '', true).img.loading).toBeUndefined();
  });
});

describe('shotSources', () => {
  it('names the two files of a screenshot, the ones every image of it loads', () => {
    expect(shot.shotSources('/projects/a.png')).toEqual({ avif: AVIF, fallback: WEBP });
  });

  it('agree with shotOf, so the hero zoom, the loader and the frame load one file', () => {
    const { img, avif } = shot.shotOf('/projects/a.png', '', true);
    expect(shot.shotSources('/projects/a.png')).toEqual({ avif, fallback: img.src });
  });

  it('lists each screenshot once and skips projects without one', () => {
    expect(shot.shotSourcesOf(['/projects/a.png', '', '/projects/b.png', '/projects/a.png'])).toEqual([
      { avif: AVIF, fallback: WEBP },
      { avif: '/shots/b-1280.avif', fallback: '/shots/b-1280.webp' },
    ]);
  });
});

describe('zoomFill', () => {
  it('gives the hero zoom the WebP file, and the AVIF first where image-set() can choose by type', () => {
    expect(shot.zoomFill({ avif: AVIF, fallback: WEBP })).toEqual({
      '--zoom-shot': `url("${WEBP}")`,
      '--zoom-set': `image-set(url("${AVIF}") type("image/avif"), url("${WEBP}") type("image/webp"))`,
    });
  });
});
