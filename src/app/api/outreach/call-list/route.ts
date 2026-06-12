import { NextResponse } from 'next/server';
import { createServerPB, authenticateAdmin } from '@/lib/pocketbase';

// Call List: leads we've emailed (contacted / follow_up_*) that haven't replied
// and that have a phone number. The phone-call escalation for email
// non-responders. Read-only; outcome logging goes through /api/leads/[id] PUT.
export async function GET() {
  try {
    const pb = createServerPB();
    await authenticateAdmin(pb);

    const emailedStatuses = ['contacted', 'follow_up_1', 'follow_up_2', 'follow_up_3'];
    const filter = emailedStatuses.map((s) => `status="${s}"`).join(' || ');

    const records = await pb.collection('wholesale_leads').getFullList({
      filter,
      sort: '-fit_score',
    });

    // Only leads with a usable phone number; richest first.
    const items = records
      .filter((r) => String(r.contact_phone || '').replace(/\D/g, '').length >= 7)
      .map((r) => ({
        id: r.id,
        business_name: r.business_name,
        contact_name: r.contact_name,
        contact_phone: r.contact_phone,
        contact_email: r.contact_email,
        website: r.website,
        city: r.city,
        state: r.state,
        fit_score: r.fit_score,
        fit_reason: r.fit_reason,
        product_fit: r.product_fit,
        status: r.status,
        follow_up_count: r.follow_up_count,
        outreach_sent_at: r.outreach_sent_at,
        notes: r.notes,
        response_notes: r.response_notes,
      }));

    return NextResponse.json({ success: true, items });
  } catch (err) {
    console.error('Call list error:', err);
    return NextResponse.json({ error: 'Failed to load call list' }, { status: 500 });
  }
}
