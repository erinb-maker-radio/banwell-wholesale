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

  // Host-based routing: stainedglassportraits.com is an exact-match SEO domain
  // that serves the direct-to-consumer portrait pages (hub + categories) from
  // the /portraits route tree. Same codebase is also deployed to
  // banwelldesigns.com, so we can't repurpose these paths globally — instead:
  //   portraits host  /            -> rewrite /portraits        (hub)
  //   portraits host  /pets etc.   -> rewrite /portraits/pets   (clean URLs)
  //   portraits host  /portraits/* -> 308 to the clean URL      (no dupes)
  //   other hosts     /pets etc.   -> 308 to the portraits domain
  const host = request.headers.get('host')?.toLowerCase() ?? '';
  const isPortraitsHost =
    host === 'stainedglassportraits.com' || host === 'www.stainedglassportraits.com';
  // Paths that map to /portraits/* on the portraits host. Note: /about and
  // /shipping exist ONLY on the portraits host — banwelldesigns.com has its own
  // (shop)/about page, so those two are rewritten here but never cross-host
  // redirected (see portraitOnlyRedirectPaths below).
  const portraitCategoryPaths = ['/pets', '/pet-memorial', '/weddings', '/about', '/shipping'];
  const portraitOnlyRedirectPaths = ['/pets', '/pet-memorial', '/weddings'];
  if (isPortraitsHost) {
    if (pathname === '/') {
      const url = request.nextUrl.clone();
      url.pathname = '/portraits';
      return NextResponse.rewrite(url);
    }
    if (portraitCategoryPaths.includes(pathname)) {
      const url = request.nextUrl.clone();
      url.pathname = '/portraits' + pathname;
      return NextResponse.rewrite(url);
    }
    // Collapse duplicate URLs so only the clean paths exist on this host.
    if (pathname === '/portraits' || pathname.startsWith('/portraits/')) {
      const url = request.nextUrl.clone();
      url.pathname = pathname.slice('/portraits'.length) || '/';
      return NextResponse.redirect(url, 308);
    }
  } else if (portraitOnlyRedirectPaths.includes(pathname)) {
    // Category links rendered on the banwelldesigns.com copy of these pages
    // should land on the canonical domain rather than 404 here.
    return NextResponse.redirect(
      new URL(pathname, 'https://stainedglassportraits.com'),
      308,
    );
  }

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
    '/',
    '/pets',
    '/pet-memorial',
    '/weddings',
    '/about',
    '/shipping',
    '/portraits',
    '/portraits/:path*',
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
