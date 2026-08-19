import { NextRequest, NextResponse } from 'next/server';

// Host-aware sitemap. The same Next.js app serves both banwelldesigns.com and
// stainedglassportraits.com, so the sitemap must describe only the pages that
// exist on the requesting host. Portraits host gets the full DTC page set with
// clean URLs; any other host gets a minimal homepage-only sitemap (the shop
// side has never had one, and inventing URLs here risks indexing junk).

const PORTRAIT_PAGES = [
  { path: '/', priority: '1.0' },
  { path: '/pets', priority: '0.9' },
  { path: '/pet-memorial', priority: '0.9' },
  { path: '/memorials', priority: '0.9' },
  { path: '/weddings', priority: '0.9' },
  { path: '/about', priority: '0.5' },
  { path: '/shipping', priority: '0.4' },
];

function xml(urls: { loc: string; priority: string }[]): string {
  const body = urls
    .map(
      u =>
        `  <url>\n    <loc>${u.loc}</loc>\n    <priority>${u.priority}</priority>\n  </url>`,
    )
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}

export function GET(request: NextRequest) {
  const host = request.headers.get('host')?.toLowerCase() ?? '';
  const isPortraits =
    host === 'stainedglassportraits.com' || host === 'www.stainedglassportraits.com';

  const urls = isPortraits
    ? PORTRAIT_PAGES.map(p => ({
        loc: `https://stainedglassportraits.com${p.path === '/' ? '' : p.path}`,
        priority: p.priority,
      }))
    : [{ loc: 'https://banwelldesigns.com', priority: '1.0' }];

  return new NextResponse(xml(urls), {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
