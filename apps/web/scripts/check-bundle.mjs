// Route-JS budget (spec line 32): the scripts each home page loads, gzipped, must stay at or below 170 kB (owner decision 2026-10-17).
// `next build` in Next 16 no longer reports First Load JS, so this reads the prerendered HTML instead.
// Usage, after `npm run build`: node apps/web/scripts/check-bundle.mjs (exits 1 when over budget);
// after `npm run build:static`: node apps/web/scripts/check-bundle.mjs --static (the export Pages serves, out/).
// To find what to cut: `npx next analyze` in apps/web.
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { gzipSync } from 'node:zlib';

/** 170 kB, counted in thousands of bytes (the stricter reading). */
export const LIMIT_BYTES = 170_000;
const ROUTES = ['en', 'ar'];
/** The address each home page is served at (owner decision 2026-10-17): English at /, Arabic at /ar. */
export const addressOf = (route) => (route === 'en' ? '/' : `/${route}`);
/** The prerendered file of each page, the same name in both modes (app/[[...locale]]: the root route is index). */
const fileOf = (route) => (route === 'en' ? 'index.html' : `${route}.html`);
/** Where each mode keeps its home pages and its `/_next/static/` files. */
const LAYOUT = {
  server: { html: ['.next', 'server', 'app'], scripts: ['.next', 'static'] },
  static: { html: ['out'], scripts: ['out', '_next', 'static'] },
};

/** The pages to measure in a build (`server`: .next, `static`: the export in out/) of the app at `app`. */
export const buildOf = (mode, app) => ({
  pages: ROUTES.map((route) => ({
    address: addressOf(route),
    file: join(app, ...LAYOUT[mode].html, fileOf(route)),
  })),
  scripts: join(app, ...LAYOUT[mode].scripts),
});
const STATIC = '/_next/static/';
/**
 * Libraries that must never reach a home-page script, each by a string only its runtime contains. zod and the
 * content stay on the server; client components read text helpers from `@zakydev/shared/text`.
 */
const FORBIDDEN = [{ name: 'zod', marker: '$ZodType' }];

/**
 * The `/_next/static/` paths of the scripts the HTML loads, once each, in order. `noModule` scripts (the legacy
 * polyfills) are left out: every browser that runs modules skips them without fetching (controller ruling, Task 13b
 * fix round 1, progress.md: browsers at the spec floor never fetch or run them). The dynamically imported
 * background chunk is not in the HTML, so it is not counted either. Inline scripts have no `src` and are skipped.
 */
export const scriptsOf = (html) => {
  const found = [];
  for (const [, attributes] of html.matchAll(/<script\b([^>]*)>/gi)) {
    if (/\bnomodule\b/i.test(attributes)) continue;
    const src = attributes.match(/\bsrc="([^"]+)"/)?.[1];
    if (!src?.startsWith(STATIC)) continue;
    const path = src.slice(STATIC.length);
    if (!found.includes(path)) found.push(path);
  }
  return found;
};

/**
 * Gzip sizes of a page's scripts, their total, whether it is over `limit`, whether it found none at all (then the
 * markup changed and nothing was measured, which must fail too), and any forbidden library found.
 */
export const measure = (html, read, limit = LIMIT_BYTES) => {
  const scripts = scriptsOf(html).map((path) => {
    const body = read(path);
    return { path, gzip: gzipSync(body).length, body };
  });
  const total = scripts.reduce((sum, s) => sum + s.gzip, 0);
  const forbidden = scripts.flatMap(({ path, body }) =>
    FORBIDDEN.filter(({ marker }) => body.includes(marker)).map(({ name }) => ({ path, name })),
  );
  return {
    scripts: scripts.map(({ path, gzip }) => ({ path, gzip })),
    total,
    over: total > limit,
    empty: scripts.length === 0,
    forbidden,
  };
};

const kB = (bytes) => `${(bytes / 1000).toFixed(1)} kB`;

const main = () => {
  const mode = process.argv.includes('--static') ? 'static' : 'server';
  const build = buildOf(mode, join(dirname(fileURLToPath(import.meta.url)), '..'));
  const read = (path) => readFileSync(join(build.scripts, path));
  let failed = false;
  for (const { address, file } of build.pages) {
    const result = measure(readFileSync(file, 'utf8'), read);
    const page = `${address} (${mode}: ${file.slice(file.lastIndexOf('/') + 1)})`;
    console.log(`${page}: ${kB(result.total)} gzip of ${kB(LIMIT_BYTES)}`);
    for (const { path, gzip } of result.scripts) console.log(`  ${kB(gzip).padStart(9)}  ${path}`);
    for (const { path, name } of result.forbidden) console.error(`  ${name} found in ${path}`);
    if (result.empty) console.error(`${page} lists no /_next/static scripts: nothing was measured`);
    if (result.over)
      console.error(`${page} is over the route-JS budget by ${kB(result.total - LIMIT_BYTES)}`);
    failed ||= result.over || result.empty || result.forbidden.length > 0;
  }
  if (failed) process.exitCode = 1;
};

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
