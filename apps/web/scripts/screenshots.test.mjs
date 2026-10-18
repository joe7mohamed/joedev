import { copyFile, mkdir, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import sharp from 'sharp';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { buildShots } from './screenshots.mjs';

let root;

beforeAll(async () => {
  root = await mkdtemp(join(tmpdir(), 'zk-shots-'));
  await mkdir(join(root, 'projects'));
  await copyFile(
    join(import.meta.dirname, '..', 'public', 'projects', 'talmeeha.jpg'),
    join(root, 'projects', 'talmeeha.jpg'),
  );
});

afterAll(() => rm(root, { recursive: true, force: true }));

describe('buildShots', () => {
  it('encodes each screenshot as a 1280 px AVIF and WebP, and keeps files newer than their source', async () => {
    const written = await buildShots(root);
    expect(written.map((p) => p.slice(root.length))).toEqual([
      '/shots/talmeeha-1280.avif',
      '/shots/talmeeha-1280.webp',
    ]);
    for (const [file, format] of [
      ['talmeeha-1280.avif', 'heif'],
      ['talmeeha-1280.webp', 'webp'],
    ]) {
      const meta = await sharp(join(root, 'shots', file)).metadata();
      expect({ format: meta.format, width: meta.width, height: meta.height }).toEqual({
        format,
        width: 1280,
        height: 800,
      });
    }
    expect(await buildShots(root)).toEqual([]);
  });
});
