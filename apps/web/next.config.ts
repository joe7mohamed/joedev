import type { NextConfig } from 'next';

const security = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'X-Frame-Options', value: 'DENY' },
  // no `includeSubDomains`: the subdomains (Google Workspace) are not audited for HTTPS yet, so it waits for that audit.
  // no `preload`: joining the browser preload list is the owner's later, deliberate choice
  { key: 'Strict-Transport-Security', value: 'max-age=31536000' },
];

const config: NextConfig = {
  transpilePackages: ['@zakydev/shared'],
  poweredByHeader: false,
  // the root layout lives in app/[locale]/, so unknown URLs need app/global-not-found.tsx
  experimental: { globalNotFound: true },
  // the default is WebP only
  images: { formats: ['image/avif', 'image/webp'] },
  async headers() {
    return [{ source: '/(.*)', headers: security }];
  },
  // one canonical host; Velocity serves both names
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.zakydev.com' }],
        destination: 'https://zakydev.com/:path*',
        permanent: true,
      },
    ];
  },
};

export default config;
