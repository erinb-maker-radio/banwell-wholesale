import { NextResponse } from 'next/server';
import { createServerPB, authenticateAdmin } from '@/lib/pocketbase';

// POST /api/vet/event — first-party analytics beacon for the portraits pages.
// Body: { event, path?, ref?, slug?, meta? }. Host comes from the request.
// No cookies, no fingerprinting — just event counts we own in PocketBase
// (collection: site_events).

const ALLOWED_EVENTS = new Set([
  'page_view',
  'order_click',
  'checkout_created',
  'thank_you',
  'photo_uploaded',
]);

export async function POST(request: Request) {
  try {
    const { event, path, ref, slug, meta } = await request.json();
    if (!ALLOWED_EVENTS.has(event)) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }
    const pb = createServerPB();
    await authenticateAdmin(pb);
    await pb.collection('site_events').create({
      event,
      path: String(path || '').slice(0, 300),
      host: (request.headers.get('host') || '').slice(0, 100),
      ref: String(ref || '').slice(0, 300),
      slug: String(slug || '').slice(0, 100),
      meta: String(meta || '').slice(0, 300),
    });
    return NextResponse.json({ ok: true });
  } catch {
    // Analytics must never break the page.
    return NextResponse.json({ ok: false });
  }
}
