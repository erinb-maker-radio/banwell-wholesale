import { NextResponse } from 'next/server';
import { createServerPB, authenticateAdmin } from '@/lib/pocketbase';

// Follow-up approval queue.
//
// PocketBase is the single source of truth: prep-outreach and follow-up-check
// both write drafts as status=outreach_drafted. 1st-contact drafts
// (follow_up_count = 0) are approved from the leads table; this endpoint serves
// the *follow-up* lane (follow_up_count >= 1), which the outreach page renders
// inline against each lead and approves via /api/outreach/approve/[id].
//
// (Previously this proxied the agent's :4101 JSON queue, which the migration to
// PocketBase orphaned — leaving the follow-up lane permanently empty.)
export async function GET() {
  try {
    const pb = createServerPB();
    await authenticateAdmin(pb);

    const records = await pb.collection('wholesale_leads').getFullList({
      filter: 'status="outreach_drafted" && follow_up_count>=1',
      sort: '-fit_score',
    });

    const items = records.map((r) => ({
      id: r.id, // the lead id — approve/[id] acts on the lead directly
      title: `Follow-up #${r.follow_up_count} — ${r.business_name}`,
      content: r.outreach_draft || '',
      metadata: {
        leadId: r.id,
        followUpNumber: r.follow_up_count,
        channel: r.outreach_channel,
        contact_email: r.contact_email,
        contact_instagram: r.contact_instagram,
        business_name: r.business_name,
      },
      created: r.last_follow_up || r.outreach_sent_at || '',
      status: 'pending',
    }));

    return NextResponse.json({ success: true, items });
  } catch (err) {
    console.error('Approval queue error:', err);
    return NextResponse.json({ success: false, error: 'Failed to load approval queue' }, { status: 500 });
  }
}
