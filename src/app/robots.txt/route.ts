import { NextRequest, NextResponse } from 'next/server';

// Host-aware robots.txt. Points crawlers at the right sitemap per host and
// keeps admin/account/api surfaces out of the index on both domains.

export function GET(request: NextRequest) {
  const host = request.headers.get('host')?.toLowerCase() ?? '';
  const isPortraits =
    host === 'stainedglassportraits.com' || host === 'www.stainedglassportraits.com';
  const base = isPortraits
    ? 'https://stainedglassportraits.com'
    : 'https://banwelldesigns.com';

  const body = [
    'User-agent: *',
    'Disallow: /admin',
    'Disallow: /api/',
    'Disallow: /account',
    'Allow: /',
    '',
    `Sitemap: ${base}/sitemap.xml`,
    '',
  ].join('\n');

  return new NextResponse(body, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
