import { NextResponse } from 'next/server';
import { createServerPB, authenticateAdmin } from '@/lib/pocketbase';

// POST /api/vet/track
// Body: { slug: string }
// Upserts a vet_clinics record and increments scan_count.
// Called client-side on every portrait/[clinic] page load.
export async function POST(request: Request) {
  try {
    const { slug } = await request.json();
    if (!slug || typeof slug !== 'string' || !/^[a-z0-9-]+$/.test(slug)) {
      return NextResponse.json({ error: 'Invalid slug' }, { status: 400 });
    }

    const pb = createServerPB();
    await authenticateAdmin(pb);

    // Find existing clinic record
    let clinic;
    try {
      const results = await pb.collection('vet_clinics').getList(1, 1, {
        filter: `slug="${slug}"`,
      });
      clinic = results.items[0];
    } catch {
      clinic = null;
    }

    if (clinic) {
      // Increment scan_count
      await pb.collection('vet_clinics').update(clinic.id, {
        scan_count: (clinic.scan_count || 0) + 1,
      });
    } else {
      // Auto-create stub record so we never lose a scan
      await pb.collection('vet_clinics').create({
        slug,
        name: slug, // placeholder — admin can fill in proper name
        scan_count: 1,
        demo_sent: false,
        display_active: false,
        angel_fund: false,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[vet/track] error:', err);
    // Don't surface errors to the client — tracking failure must be silent
    return NextResponse.json({ ok: false });
  }
}
