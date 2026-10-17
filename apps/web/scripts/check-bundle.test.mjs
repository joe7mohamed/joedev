import { gzipSync } from 'node:zlib';
import { describe, expect, it } from 'vitest';
import { LIMIT_BYTES, measure, scriptsOf } from './check-bundle.mjs';

const html = [
  '<!DOCTYPE html><html><head>',
  '<link rel="preload" as="script" fetchPriority="low" href="/_next/static/chunks/preloaded.js"/>',
  '<script src="/_next/static/chunks/a.js" async=""></script>',
  '<script src="/_next/static/chunks/turbopack-b.js" async=""></script>',
  '<script src="/_next/static/chunks/polyfill.js" noModule=""></script>',
  '</head><body>',
  '<script>self.__next_f.push([1,"<script src=\\"/_next/static/chunks/inline.js\\">"])</script>',
  '<script src="/elsewhere.js"></script>',
  '<script src="/_next/static/chunks/a.js" async=""></script>',
  '</body></html>',
].join('');

describe('route scripts', () => {
  it('lists each script the HTML loads from /_next/static once, in order', () => {
    expect(scriptsOf(html)).toEqual(['chunks/a.js', 'chunks/turbopack-b.js']);
  });

  it('leaves out noModule scripts, which no module-capable browser fetches', () => {
    expect(scriptsOf('<script src="/_next/static/chunks/p.js" nomodule></script>')).toEqual([]);
  });
});

describe('measure', () => {
  const files = { 'chunks/a.js': 'a'.repeat(5000), 'chunks/turbopack-b.js': 'let b = 1;' };
  const read = (path) => {
    if (!(path in files)) throw new Error(`unexpected read of ${path}`);
    return Buffer.from(files[path]);
  };

  it('sums the gzip size of every route script', () => {
    const result = measure(html, read);
    const sizes = Object.values(files).map((body) => gzipSync(body).length);
    expect(result.scripts.map((s) => s.path)).toEqual(Object.keys(files));
    expect(result.total).toBe(sizes[0] + sizes[1]);
    expect(result.over).toBe(false);
  });

  it('fails above the limit', () => {
    expect(measure(html, read, 10).over).toBe(true);
    expect(LIMIT_BYTES).toBe(150_000);
  });

  it('names a forbidden library found in a route script', () => {
    const zod = { ...files, 'chunks/a.js': 'class X{static name="$ZodType"}' };
    const result = measure(html, (path) => Buffer.from(zod[path]));
    expect(result.forbidden).toEqual([{ path: 'chunks/a.js', name: 'zod' }]);
    expect(measure(html, read).forbidden).toEqual([]);
  });
});
