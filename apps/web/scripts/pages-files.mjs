// Finishes the static export for Cloudflare Pages (Pages round, owner decision 2026-10-18), after
// `STATIC_EXPORT=1 next build` (npm run build:static): writes out/_headers and out/_redirects from the module
// next.config.ts reads for `next start` (src/lib/http-headers.ts), so both modes send the same headers and redirects,
// and checks the files Pages routes by. Without a top-level 404.html, Pages would serve the home page for every
// unknown path (its single-page-application mode).
// Usage: node apps/web/scripts/pages-files.mjs (exits 1 when a required file is missing).
import { existsSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { pagesHeaders, pagesRedirects } from '../src/lib/http-headers.ts';

/** What Pages must find in out/: both home pages (served at / and /ar), the 404 page, and what the head links. */
export const REQUIRED = [
  'index.html',
  'ar.html',
  '404.html',
  'opengraph-image',
  'ar/opengraph-image',
  'sitemap.xml',
  'robots.txt',
  'manifest.webmanifest',
  'icon.svg',
  'apple-icon',
  'app-icons/icon-192.png',
  'app-icons/icon-512.png',
  'app-icons/maskable-512.png',
  'shots/nuammer-1280.avif',
  'shots/nuammer-1280.webp',
];

export const missingFrom = (out, exists = existsSync) => REQUIRED.filter((file) => !exists(join(out, file)));

const main = () => {
  const out = join(dirname(fileURLToPath(import.meta.url)), '..', 'out');
  const missing = missingFrom(out);
  if (missing.length > 0) {
    console.error(`pages-files: out/ lacks ${missing.join(', ')}`);
    process.exitCode = 1;
    return;
  }
  // a static export is a production build: the shipped policy, never the development one
  writeFileSync(join(out, '_headers'), pagesHeaders('production'));
  writeFileSync(join(out, '_redirects'), pagesRedirects());
  console.log('pages-files: wrote out/_headers and out/_redirects');
};

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
