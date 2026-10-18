import type { NextConfig } from 'next';
import { serverHeaders, serverRedirects } from './src/lib/http-headers.ts';

const config: NextConfig = {
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
    // the default is WebP only
    formats: ['image/avif', 'image/webp'],
    // The screenshots are 1280 px wide, so nothing larger is ever useful. Ending the list at 1280 also gives a
    // 1280 px image a single srcset candidate, so the hero zoom (a CSS background) and the work frame load the
    // same optimised URL at every viewport and pixel density (components/work/screenshot.ts).
    deviceSizes: [640, 750, 828, 1080, 1280],
  },
  // the security headers and the redirects (www to the bare host, /en to /), from one module (src/lib/http-headers.ts)
  async headers() {
    return serverHeaders(process.env.NODE_ENV);
  },
  async redirects() {
    return serverRedirects();
  },
};

export default config;
