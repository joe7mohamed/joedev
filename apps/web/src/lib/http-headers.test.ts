import { describe, expect, it } from 'vitest';
import { contentSecurityPolicy } from './csp';
import {
  HOME_REDIRECTS,
  IMMUTABLE,
  PAGES_DEV_ORIGIN,
  pagesHeaders,
  pagesRedirects,
  REVALIDATE,
  securityHeaders,
  serverHeaders,
  serverRedirects,
} from './http-headers';

type Rule = { path: string; set: Map<string, string>; detach: string[] };

/** Reads a Cloudflare Pages `_headers` file back into its rules, as Pages does: a path line, then indented headers. */
const parseHeaders = (file: string): Rule[] => {
  const rules: Rule[] = [];
  for (const line of file.split('\n')) {
    if (line.trim() === '' || line.startsWith('#')) continue;
    if (!line.startsWith(' ')) {
      rules.push({ path: line, set: new Map(), detach: [] });
      continue;
    }
    const rule = rules.at(-1);
    if (!rule) throw new Error(`a header before any path: ${line}`);
    const text = line.trim();
    if (text.startsWith('! ')) rule.detach.push(text.slice(2));
    else {
      const colon = text.indexOf(':');
      rule.set.set(text.slice(0, colon), text.slice(colon + 1).trim());
    }
  }
  return rules;
};

describe('securityHeaders', () => {
  it('carries the shipped policy and HSTS without includeSubDomains or preload', () => {
    const headers = new Map(securityHeaders('production').map((h) => [h.key, h.value]));
    expect(headers.get('Content-Security-Policy')).toBe(contentSecurityPolicy('production'));
    expect(headers.get('Strict-Transport-Security')).toBe('max-age=31536000');
    expect(headers.get('X-Frame-Options')).toBe('DENY');
    expect(headers.get('X-Content-Type-Options')).toBe('nosniff');
    expect(headers.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin');
    expect(headers.get('Permissions-Policy')).toBe('camera=(), microphone=(), geolocation=()');
  });
});

describe('the two deploy modes', () => {
  it('send identical security headers: next start (headers()) and Pages (out/_headers)', () => {
    const server = serverHeaders('production');
    expect(server).toEqual([{ source: '/(.*)', headers: securityHeaders('production') }]);
    const all = parseHeaders(pagesHeaders('production')).find((r) => r.path === '/*');
    expect(all).toBeDefined();
    for (const { key, value } of securityHeaders('production')) expect(all?.set.get(key), key).toBe(value);
  });

  it('redirect /en to / permanently in both, from the one list', () => {
    expect(HOME_REDIRECTS).toEqual([{ source: '/en', destination: '/' }]);
    expect(serverRedirects()).toContainEqual({ source: '/en', destination: '/', permanent: true });
    expect(pagesRedirects().trim().split('\n')).toEqual(['/en / 308', '/en/ / 308']);
  });

  it('keep the www redirect first on next start, so www.zakydev.com/en lands on the bare host first', () => {
    expect(serverRedirects()[0]).toMatchObject({ has: [{ type: 'host', value: 'www.zakydev.com' }] });
  });
});

describe('pagesHeaders', () => {
  const rules = parseHeaders(pagesHeaders('production'));
  const rule = (path: string) => rules.find((r) => r.path === path);

  it('makes HTML and every other file revalidate, and drops the CORS header Pages adds by default', () => {
    expect(rule('/*')?.set.get('Cache-Control')).toBe(REVALIDATE);
    expect(rule('/*')?.detach).toContain('Access-Control-Allow-Origin');
  });

  it('caches the hashed build files, fonts included (/_next/static/media), for a year, immutable', () => {
    expect(rule('/_next/static/*')?.detach).toEqual(['Cache-Control']);
    expect(rule('/_next/static/*')?.set.get('Cache-Control')).toBe(IMMUTABLE);
    expect(IMMUTABLE).toBe('public, max-age=31536000, immutable');
  });

  it('types the build-time PNGs Next exports without a file extension', () => {
    for (const path of ['/opengraph-image', '/ar/opengraph-image', '/apple-icon'])
      expect(rule(path)?.set.get('Content-Type'), path).toBe('image/png');
  });

  it('keeps the project address zakydev.pages.dev out of search engines, and only that host', () => {
    expect(rule(`${PAGES_DEV_ORIGIN}/*`)?.set.get('X-Robots-Tag')).toBe('noindex');
    expect(PAGES_DEV_ORIGIN).toBe('https://zakydev.pages.dev');
    expect(rule('/*')?.set.has('X-Robots-Tag')).toBe(false);
  });

  it('stays within the Pages limits: 100 rules, 2,000 characters a line', () => {
    const file = pagesHeaders('production');
    expect(parseHeaders(file).length).toBeLessThanOrEqual(100);
    for (const line of file.split('\n')) expect(line.length).toBeLessThanOrEqual(2000);
  });
});
