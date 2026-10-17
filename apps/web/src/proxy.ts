import { DEFAULT_LOCALE } from '@zakydev/shared/locales';
import { type NextRequest, NextResponse } from 'next/server';

/**
 * Owner decision 2026-10-17: English lives at the plain domain and Arabic at /ar, for every visitor alike. The page
 * is still built as the internal `en` route, so `/` is a rewrite to it (the browser keeps `/`, and the prerendered
 * page is served as it is), and the internal address itself redirects permanently to `/`, query string and all.
 */
const INTERNAL = `/${DEFAULT_LOCALE}`;

export function proxy(request: NextRequest) {
  const url = request.nextUrl.clone();
  if (url.pathname === '/') {
    url.pathname = INTERNAL;
    return NextResponse.rewrite(url);
  }
  url.pathname = '/';
  return NextResponse.redirect(url, 308);
}

// only these two: /ar, the sharing images (/en/opengraph-image) and every other file never pass through the proxy
export const config = { matcher: ['/', '/en'] };
