import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Old leather URLs that need redirecting to /leather/*
const leatherRedirects: Record<string, string> = {
  '/plague-doctor': '/leather/plague-doctor',
  '/fashion-masks': '/leather/fashion-masks',
  '/steampunk': '/leather/steampunk',
  '/gallery': '/leather/gallery',
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Redirect old leather URLs to new /leather/* paths (308 Permanent)
  // Check exact matches first
  if (leatherRedirects[pathname]) {
    const url = request.nextUrl.clone();
    url.pathname = leatherRedirects[pathname];
    return NextResponse.redirect(url, 308);
  }

  // Handle /plague-doctor/[slug] -> /leather/plague-doctor/[slug]
  if (pathname.startsWith('/plague-doctor/')) {
    const url = request.nextUrl.clone();
    url.pathname = '/leather' + pathname;
    return NextResponse.redirect(url, 308);
  }

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
  matcher: [
    '/account/:path*',
    '/plague-doctor',
    '/plague-doctor/:path*',
    '/fashion-masks',
    '/steampunk',
    '/gallery',
  ],
};
