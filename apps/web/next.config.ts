import type { NextConfig } from 'next';
import { serverHeaders, serverRedirects } from './src/lib/http-headers.ts';

/**
 * Two deploy modes (Pages round, owner decision 2026-10-18), built from the same routes and the same HTML:
 * - server mode, `npm run build` + `npm start` (`next start`, as on Cloudways Velocity), which sends the headers and
 *   the redirects below;
 * - static mode, `npm run build:static` (STATIC_EXPORT=1), a static export to out/ for Cloudflare Pages. A static
 *   export cannot send headers or redirects, so scripts/pages-files.mjs writes the same ones from the same module
 *   (src/lib/http-headers.ts) to out/_headers and out/_redirects. It still builds in .next, so after a static
 *   build, build again in server mode before `npm start`.
 */
const STATIC = process.env.STATIC_EXPORT === '1';

const server: NextConfig = {
  async headers() {
    return serverHeaders(process.env.NODE_ENV);
  },
  async redirects() {
    return serverRedirects();
  },
};

const config: NextConfig = {
  ...(STATIC ? { output: 'export' } : server),
  transpilePackages: ['@zakydev/shared'],
  // the sharing image's renderers load their own wasm and native binary from disk, so Node resolves them unbundled
  serverExternalPackages: ['satori', '@resvg/resvg-js'],
  poweredByHeader: false,
  // always defined, so Next inlines it as a literal even when unset and the test-only code it guards
  // (src/lib/e2e.ts) folds away in production builds
  env: { NEXT_PUBLIC_E2E: process.env.NEXT_PUBLIC_E2E === '1' ? '1' : '' },
  // the root layout lives in app/[[...locale]]/, so unknown URLs need app/global-not-found.tsx
  experimental: { globalNotFound: true },
  images: {
    // No image server in either mode: the screenshots are encoded at build time (scripts/screenshots.mjs) and this
    // loader maps next/image's (src, width) to those files, so both modes render the same HTML.
    loader: 'custom',
    loaderFile: './src/lib/image-loader.ts',
    // The screenshots are 1280 px wide, so nothing larger is ever useful. Ending the list at 1280 also gives a
    // 1280 px image a single srcset candidate, so the hero zoom (a CSS background, which cannot follow an `<img>`
    // srcset) and the work frame load the same file at every viewport and pixel density (components/work/screenshot.ts).
    deviceSizes: [640, 750, 828, 1080, 1280],
  },
};

export default config;
