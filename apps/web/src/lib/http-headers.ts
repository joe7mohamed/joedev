import { contentSecurityPolicy } from './csp.ts';

/*
 * The site's HTTP headers and redirects, written once for both deploy modes (Pages round, owner decision 2026-10-18):
 * `next start` reads them through next.config.ts (headers(), redirects()), and the static export for Cloudflare Pages
 * gets them as out/_headers and out/_redirects (scripts/pages-files.mjs), so the two never drift.
 * No imports beyond ./csp.ts (with its extension): Node runs this file directly in the post-build script.
 */

export type Header = { key: string; value: string };

/** Every response, in both modes. */
export const securityHeaders = (nodeEnv: string | undefined): Header[] => [
  { key: 'Content-Security-Policy', value: contentSecurityPolicy(nodeEnv) },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'X-Frame-Options', value: 'DENY' },
  // no `includeSubDomains`: the subdomains (Google Workspace) are not audited for HTTPS yet, so it waits for that audit.
  // no `preload`: joining the browser preload list is the owner's later, deliberate choice
  { key: 'Strict-Transport-Security', value: 'max-age=31536000' },
];

/** The home page's old internal address: a permanent redirect to the root, query string kept (both modes). */
export const HOME_REDIRECTS = [{ source: '/en', destination: '/' }] as const;

/** next.config.ts `headers()`. */
export const serverHeaders = (nodeEnv: string | undefined) => [
  { source: '/(.*)', headers: securityHeaders(nodeEnv) },
];

/**
 * next.config.ts `redirects()`. The www host comes first, so www.zakydev.com/en reaches the bare host before the /en
 * rule. On Pages, www is a Cloudflare Redirect Rule instead (docs/DEPLOY.md), so it is not in out/_redirects.
 */
export const serverRedirects = () => [
  {
    source: '/:path*',
    has: [{ type: 'host' as const, value: 'www.zakydev.com' }],
    destination: 'https://zakydev.com/:path*',
    permanent: true,
  },
  ...HOME_REDIRECTS.map((r) => ({ ...r, permanent: true })),
];

/** Hashed build files (/_next/static/: scripts, styles, and every font, self-hosted or from next/font). */
export const IMMUTABLE = 'public, max-age=31536000, immutable';
/** Everything else, HTML first: the browser may keep it but asks again (ETag) before each use. */
export const REVALIDATE = 'public, max-age=0, must-revalidate';
/** Next exports these build-time PNG routes as files without an extension, so Pages cannot guess their type. */
const EXTENSIONLESS_PNGS = ['/opengraph-image', '/ar/opengraph-image', '/apple-icon'];
/**
 * The Pages project's own address (project `zakydev`, docs/DEPLOY.md). Pages marks only the hashed previews
 * noindex, so this rule keeps search engines on zakydev.com; a rule with a full URL matches that host only.
 */
export const PAGES_DEV_ORIGIN = 'https://zakydev.pages.dev';

const block = (path: string, lines: string[]): string => [path, ...lines.map((l) => `  ${l}`)].join('\n');

/**
 * out/_headers. Pages joins a header that several matching rules set with a comma, so the long cache detaches the
 * general one (`! Cache-Control`) before it sets its own. `next start` sends no CORS header; Pages adds
 * `Access-Control-Allow-Origin: *` to every file by default, so it is detached too.
 */
export const pagesHeaders = (nodeEnv: string | undefined): string =>
  `${[
    block('/*', [
      ...securityHeaders(nodeEnv).map((h) => `${h.key}: ${h.value}`),
      `Cache-Control: ${REVALIDATE}`,
      '! Access-Control-Allow-Origin',
    ]),
    block('/_next/static/*', ['! Cache-Control', `Cache-Control: ${IMMUTABLE}`]),
    ...EXTENSIONLESS_PNGS.map((path) => block(path, ['Content-Type: image/png'])),
    block(`${PAGES_DEV_ORIGIN}/*`, ['X-Robots-Tag: noindex']),
  ].join('\n\n')}\n`;

/** out/_redirects: each redirect, with and without its trailing slash, as a 308. */
export const pagesRedirects = (): string =>
  `${HOME_REDIRECTS.flatMap(({ source, destination }) => [
    `${source} ${destination} 308`,
    `${source}/ ${destination} 308`,
  ]).join('\n')}\n`;
