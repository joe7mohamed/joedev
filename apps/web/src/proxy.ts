import { pickLocale } from '@zakydev/shared';
import { type NextRequest, NextResponse } from 'next/server';

export function proxy(request: NextRequest) {
  const locale = pickLocale(request.headers.get('accept-language'));
  const target = request.nextUrl.clone();
  target.pathname = `/${locale}`;
  const response = NextResponse.redirect(target, 307);
  // the answer depends on the visitor's language, so no shared cache may keep it
  response.headers.set('Vary', 'Accept-Language');
  response.headers.set('Cache-Control', 'private, no-store');
  return response;
}

export const config = { matcher: ['/'] };
