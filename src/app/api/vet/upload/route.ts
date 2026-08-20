import { NextResponse } from 'next/server';
import { createServerPB, authenticateAdmin } from '@/lib/pocketbase';

// POST /api/vet/upload — multipart form: { order: <vet_orders id>, photo: File }
// Lets the buyer attach their design photo directly from the thank-you page
// instead of waiting for a manual email round-trip (the step where orders have
// stalled before). Accepts up to 3 images, 15MB each.

const ALLOWED_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
]);
const MAX_BYTES = 50 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const orderId = String(form.get('order') || '').trim();
    const files = form.getAll('photo').filter((f): f is File => f instanceof File);

    // PB record ids are 15-char alphanumeric — reject anything else early.
    if (!/^[a-z0-9]{15}$/i.test(orderId)) {
      return NextResponse.json({ error: 'Invalid order reference.' }, { status: 400 });
    }
    if (!files.length) {
      return NextResponse.json({ error: 'No photo attached.' }, { status: 400 });
    }
    for (const f of files) {
      if (!ALLOWED_TYPES.has(f.type)) {
        return NextResponse.json(
          { error: 'Please upload a JPG, PNG, WebP, or HEIC photo.' },
          { status: 400 },
        );
      }
      if (f.size > MAX_BYTES) {
        return NextResponse.json(
          { error: 'That photo is over 50MB — please send a smaller version.' },
          { status: 400 },
        );
      }
    }

    const pb = createServerPB();
    await authenticateAdmin(pb);

    // Confirm the order exists before accepting files.
    const order = await pb.collection('vet_orders').getOne(orderId).catch(() => null);
    if (!order) {
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    }

    const update = new FormData();
    for (const f of files) update.append('photo', f);
    update.append('photo_received', 'true');
    await pb.collection('vet_orders').update(orderId, update);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[vet/upload] error:', err);
    return NextResponse.json(
      { error: 'Upload failed — please try again or email erin@banwelldesigns.com.' },
      { status: 500 },
    );
  }
}
