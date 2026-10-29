import { NextResponse, type NextRequest } from 'next/server';
import { getClientEnv } from '@/config/env';

const PROTECTED_PREFIXES = [
  '/abastecimento',
  '/custos-multas',
  '/malha-pneus',
  '/pneus',
  '/veiculos',
];

export function middleware(request: NextRequest) {
  const { appMode } = getClientEnv();
  const { pathname } = request.nextUrl;

  if (appMode !== 'API') {
    return NextResponse.next();
  }

  const isProtected =
    pathname === '/' ||
    PROTECTED_PREFIXES.some(
      (prefix) => pathname === prefix || pathname.startsWith(prefix + '/')
    );

  if (!isProtected) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get('fw_session')?.value;
  if (!sessionCookie) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    const response = NextResponse.redirect(loginUrl);
    response.headers.set('Cache-Control', 'no-store, private');
    return response;
  }

  const response = NextResponse.next();
  response.headers.set('Cache-Control', 'no-store, private');
  return response;
}

export const config = {
  matcher: [
    '/',
    '/abastecimento/:path*',
    '/custos-multas/:path*',
    '/malha-pneus/:path*',
    '/pneus/:path*',
    '/veiculos/:path*',
  ],
};
