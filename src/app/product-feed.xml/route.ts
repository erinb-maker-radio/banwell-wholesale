import { NextRequest, NextResponse } from 'next/server';

// Google Merchant Center product feed — stainedglassportraits.com only.
// Free Shopping-tab listings: each size is an offer in one item_group so
// Google shows them as variants of a single product. Custom/handmade goods
// have no GTIN, so identifier_exists=false is required to pass validation.
// Register in Merchant Center: Products -> Feeds -> scheduled fetch of
// https://stainedglassportraits.com/product-feed.xml

const BASE = 'https://stainedglassportraits.com';

const SIZES = [
  { key: '3"', slug: '3in', price: '135.00' },
  { key: '6"', slug: '6in', price: '172.00' },
  { key: '10"', slug: '10in', price: '198.00' },
  { key: '12"', slug: '12in', price: '229.00' },
  { key: '15"', slug: '15in', price: '253.00' },
];

const DESCRIPTION =
  'A custom stained glass style portrait suncatcher, designed from your photo and ' +
  'printed on real glass. Designed and made by a real couple in Chico, California. ' +
  'You approve a digital proof of the artwork before anything is made. Hand-finished, ' +
  'sealed, and shipped with tracking. Pets, memorials, weddings, and more.';

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function GET(request: NextRequest) {
  const host = request.headers.get('host')?.toLowerCase() ?? '';
  const isPortraits =
    host === 'stainedglassportraits.com' || host === 'www.stainedglassportraits.com';
  if (!isPortraits) {
    return new NextResponse('Not found', { status: 404 });
  }

  const items = SIZES.map(s =>
    [
      '    <item>',
      `      <g:id>SUN-100-${s.slug}</g:id>`,
      `      <g:item_group_id>SUN-100</g:item_group_id>`,
      `      <g:title>${esc(`Custom Stained Glass Style Portrait Suncatcher — ${s.key} — From Your Photo`)}</g:title>`,
      `      <g:description>${esc(DESCRIPTION)}</g:description>`,
      `      <g:link>${BASE}/</g:link>`,
      `      <g:image_link>${BASE}/images/vet/bulldog-window.jpg</g:image_link>`,
      `      <g:price>${s.price} USD</g:price>`,
      '      <g:availability>in_stock</g:availability>',
      '      <g:condition>new</g:condition>',
      '      <g:brand>Banwell Designs</g:brand>',
      '      <g:identifier_exists>false</g:identifier_exists>',
      `      <g:size>${esc(s.key)}</g:size>`,
      '      <g:product_type>Home &amp; Garden &gt; Decor &gt; Suncatchers</g:product_type>',
      '      <g:google_product_category>Home &amp; Garden &gt; Decor &gt; Suncatchers</g:google_product_category>',
      '      <g:is_bundle>false</g:is_bundle>',
      '    </item>',
    ].join('\n'),
  ).join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Stained Glass Portraits — Banwell Designs</title>
    <link>${BASE}</link>
    <description>Custom stained glass style portrait suncatchers designed from your photo.</description>
${items}
  </channel>
</rss>
`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
