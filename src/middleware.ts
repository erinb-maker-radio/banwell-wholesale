import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Old leather URLs that need redirecting to /leather/*
const leatherRedirects: Record<string, string> = {
  '/plague-doctor': '/leather/plague-doctor',
  '/fashion-masks': '/leather/fashion-masks',
  '/steampunk': '/leather/steampunk',
  '/gallery': '/leather/gallery',
};

// Admin API prefixes. These routes use a PocketBase superuser server-side and
// must only ever be reached by an authenticated admin. Customer/public API
// routes (account, auth, public, shop, subscribe, webhooks, cron) are NOT here.
const adminApiPrefixes = [
  '/api/leads',
  '/api/customers',
  '/api/orders',
  '/api/invoices',
  '/api/products',
  '/api/dashboard',
  '/api/reports',
  '/api/communications',
  '/api/outreach',
  '/api/admin',
];

function requiresAdmin(pathname: string): boolean {
  if (pathname === '/admin' || pathname.startsWith('/admin/')) return true;
  return adminApiPrefixes.some(
    (p) => pathname === p || pathname.startsWith(p + '/'),
  );
}

function unauthorized(message: string): NextResponse {
  return new NextResponse(message, {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="Banwell Admin"' },
  });
}

// Length-independent constant-time-ish string compare.
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Redirect old leather URLs to new /leather/* paths (308 Permanent)
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

  // Gate the admin dashboard + admin APIs with HTTP Basic Auth.
  // Fails CLOSED: if the env credentials are unset, access is denied rather
  // than silently re-opened. Set ADMIN_USER / ADMIN_PASSWORD in Vercel.
  if (requiresAdmin(pathname)) {
    const user = process.env.ADMIN_USER;
    const pass = process.env.ADMIN_PASSWORD;
    if (!user || !pass) {
      return new NextResponse('Admin auth not configured', { status: 503 });
    }
    const header = request.headers.get('authorization');
    if (!header || !header.startsWith('Basic ')) {
      return unauthorized('Authentication required');
    }
    let decoded = '';
    try {
      decoded = atob(header.slice(6));
    } catch {
      return unauthorized('Invalid credentials');
    }
    const idx = decoded.indexOf(':');
    const u = idx >= 0 ? decoded.slice(0, idx) : decoded;
    const p = idx >= 0 ? decoded.slice(idx + 1) : '';
    if (!safeEqual(u, user) || !safeEqual(p, pass)) {
      return unauthorized('Invalid credentials');
    }
  }

  // Protect /account/* routes - require customer auth.
  // Exception: the post-payment thank-you page is reached via a cross-site
  // redirect from Square, which doesn't carry the auth cookie — don't bounce it.
  if (pathname.startsWith('/account') && !pathname.startsWith('/account/checkout/thank-you')) {
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
    '/admin',
    '/admin/:path*',
    '/api/leads/:path*',
    '/api/customers/:path*',
    '/api/orders/:path*',
    '/api/invoices/:path*',
    '/api/products/:path*',
    '/api/dashboard',
    '/api/reports',
    '/api/communications/:path*',
    '/api/outreach/:path*',
    '/api/admin/:path*',
    '/plague-doctor',
    '/plague-doctor/:path*',
    '/fashion-masks',
    '/steampunk',
    '/gallery',
  ],
};
