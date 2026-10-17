import { imageConfigDefault } from 'next/dist/shared/lib/image-config';
import { beforeAll, describe, expect, it } from 'vitest';
import config from '../../../next.config';

type Module = typeof import('./screenshot');
let shot: Module;

beforeAll(async () => {
  // Next's bundler inlines the image options into next/image; here they are given the same way, as a plain object
  // (a plain process.env keeps it an object instead of coercing it to a string), before next/image first loads.
  process.env = { ...process.env, __NEXT_IMAGE_OPTS: { ...imageConfigDefault, ...config.images } as never };
  shot = await import('./screenshot');
});

describe('shotUrl', () => {
  it('is the 1280 px optimised URL, the only candidate next/image offers for a screenshot', async () => {
    const { getImageProps } = await import('next/image');
    const { props } = getImageProps({ src: '/projects/a.png', alt: '', ...shot.SHOT });
    expect(shot.shotUrl('/projects/a.png')).toBe('/_next/image?url=%2Fprojects%2Fa.png&w=1280&q=75');
    expect(props.srcSet?.split(', ').map((c) => c.split(' ')[0])).toEqual([shot.shotUrl('/projects/a.png')]);
  });
});

describe('shotUrls', () => {
  it('lists each screenshot once, at that URL, and skips projects without one', () => {
    expect(shot.shotUrls(['/projects/a.png', '', '/projects/b.png', '/projects/a.png'])).toEqual([
      '/_next/image?url=%2Fprojects%2Fa.png&w=1280&q=75',
      '/_next/image?url=%2Fprojects%2Fb.png&w=1280&q=75',
    ]);
  });
});

describe('shotOf', () => {
  it('gives the <img> attributes next/image would render, lazy unless eager', () => {
    const lazy = shot.shotOf('/projects/a.png', 'A home page');
    expect(lazy).toMatchObject({ alt: 'A home page', width: 1280, height: 800, loading: 'lazy' });
    expect(lazy.src).toBe(shot.shotUrl('/projects/a.png'));
    expect(shot.shotOf('/projects/a.png', '', true).loading).toBeUndefined();
  });
});
