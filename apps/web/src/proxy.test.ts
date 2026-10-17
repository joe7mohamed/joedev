import { NextRequest } from 'next/server';
import { describe, expect, it } from 'vitest';
import { config, proxy } from './proxy';

const ORIGIN = 'http://localhost:3000';
const run = (path: string, headers: Record<string, string> = {}) =>
  proxy(new NextRequest(`${ORIGIN}${path}`, { headers }));

// Owner decision 2026-10-17: English at the plain domain, Arabic at /ar, /en is a permanent redirect to /.
describe('proxy', () => {
  it('serves the English page at / for every visitor, without redirecting', () => {
    for (const language of ['en-US', 'ar-BH', 'fr-FR']) {
      const response = run('/', { 'accept-language': language });
      expect(response.status).toBe(200);
      expect(response.headers.get('location')).toBeNull();
      expect(response.headers.get('x-middleware-rewrite')).toBe(`${ORIGIN}/en`);
    }
  });

  it('keeps the query string on the rewrite', () => {
    expect(run('/?utm=1').headers.get('x-middleware-rewrite')).toBe(`${ORIGIN}/en?utm=1`);
  });

  it('no longer varies the answer by language or forbids caching it', () => {
    const response = run('/', { 'accept-language': 'ar-BH' });
    expect(response.headers.get('vary')).toBeNull();
    expect(response.headers.get('cache-control')).toBeNull();
  });

  it('redirects /en permanently to / and keeps the query string', () => {
    const response = run('/en?utm=1');
    expect(response.status).toBe(308);
    expect(response.headers.get('location')).toBe(`${ORIGIN}/?utm=1`);
  });

  it("passes Next's other forms of the two paths through instead of redirecting them", () => {
    for (const path of ['/index', '/en.json', '/en.rsc']) {
      const response = run(path);
      expect(response.status, path).toBe(200);
      expect(response.headers.get('location'), path).toBeNull();
      expect(response.headers.get('x-middleware-next'), path).toBe('1');
    }
  });

  it('runs only on / and /en, so /ar, the sharing images and the rest never pass through it', () => {
    expect(config.matcher).toEqual(['/', '/en']);
  });
});
