// Encodes the project screenshots for both deploy modes (Pages round, owner decision 2026-10-18): every
// public/projects/<name>.jpg becomes public/shots/<name>-1280.avif and .webp, with the settings of the image server
// they replace (src/lib/shot-files.ts). Runs before every `next build` and `next dev` (package.json); a file newer
// than its source is kept. public/shots/ is built, not committed (.gitignore).
// Usage: node apps/web/scripts/screenshots.mjs
import { mkdir, readdir, rename, stat, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import sharp from 'sharp';
import {
  ENCODING,
  OUT_DIR,
  SHOT_FORMATS,
  SHOT_WIDTH,
  SOURCE_DIR,
  shotFile,
  shotName,
} from '../src/lib/shot-files.ts';

const PUBLIC = join(dirname(fileURLToPath(import.meta.url)), '..', 'public');

const mtimeOf = async (path) => {
  try {
    return (await stat(path)).mtimeMs;
  } catch {
    return -1;
  }
};

/** One encoding, as Next's image server makes it: EXIF rotation applied, never enlarged. */
export const encode = (input, format) =>
  sharp(input)
    .rotate()
    .resize(SHOT_WIDTH, undefined, { withoutEnlargement: true })
    [format](ENCODING[format])
    .toBuffer();

/** Encodes every screenshot that has no up-to-date file; returns the files written. */
export const buildShots = async (root = PUBLIC) => {
  const sources = (await readdir(join(root, SOURCE_DIR))).filter((file) =>
    shotName(`/${SOURCE_DIR}/${file}`),
  );
  if (sources.length === 0) throw new Error(`screenshots: no screenshot in ${join(root, SOURCE_DIR)}`);
  await mkdir(join(root, OUT_DIR), { recursive: true });
  const written = [];
  for (const file of sources) {
    const source = join(root, SOURCE_DIR, file);
    for (const format of SHOT_FORMATS) {
      const target = join(root, shotFile(`/${SOURCE_DIR}/${file}`, SHOT_WIDTH, format));
      if ((await mtimeOf(target)) >= (await mtimeOf(source))) continue;
      // written beside and renamed, so an interrupted build never leaves half a file behind
      await writeFile(`${target}.part`, await encode(source, format));
      await rename(`${target}.part`, target);
      written.push(target);
    }
  }
  return written;
};

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const written = await buildShots();
  console.log(`screenshots: ${written.length} file(s) encoded into public/${OUT_DIR}/`);
}
