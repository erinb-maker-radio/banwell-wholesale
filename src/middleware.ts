import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect /account/* routes - require customer auth
  if (pathname.startsWith('/account')) {
    const authCookie = request.cookies.get('pb_auth');
    if (!authCookie?.value) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/account/:path*'],
};
