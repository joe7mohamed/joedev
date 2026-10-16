import { pickLocale } from '@zakydev/shared';
import { type NextRequest, NextResponse } from 'next/server';

export function proxy(request: NextRequest) {
  const locale = pickLocale(request.headers.get('accept-language'));
  return NextResponse.redirect(new URL(`/${locale}`, request.url), 307);
}

export const config = { matcher: ['/'] };
