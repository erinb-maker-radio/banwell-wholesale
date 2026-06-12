import { NextRequest, NextResponse } from 'next/server';
import { createServerPB, authenticateAdmin } from '@/lib/pocketbase';

// Approve / reject / edit a follow-up draft. The [id] is the wholesale_leads id.
//   {}                              -> approve  (status = outreach_approved)
//   { editedContent }               -> edit + approve
//   { action: 'reject', reason }    -> send back for re-draft (status = qualified)
// send-approved.js then picks up outreach_approved leads and sends them.
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) return NextResponse.json({ success: false, error: 'Missing id' }, { status: 400 });

  try {
    const pb = createServerPB();
    await authenticateAdmin(pb);

    let body: { action?: string; reason?: string; editedContent?: string } = {};
    try {
      const raw = await req.text();
      body = raw ? JSON.parse(raw) : {};
    } catch {
      body = {};
    }

    let update: Record<string, unknown>;
    if (body.action === 'reject') {
      const lead = await pb.collection('wholesale_leads').getOne(id, { fields: 'notes' });
      const note = `[${new Date().toISOString().slice(0, 10)}] Follow-up rejected${body.reason ? `: ${body.reason}` : ''}`;
      update = {
        status: 'qualified',
        outreach_draft: '',
        notes: lead.notes ? `${lead.notes}\n${note}` : note,
      };
    } else if (typeof body.editedContent === 'string') {
      update = { outreach_draft: body.editedContent, status: 'outreach_approved' };
    } else {
      update = { status: 'outreach_approved' };
    }

    const record = await pb.collection('wholesale_leads').update(id, update);
    return NextResponse.json({ success: true, data: record });
  } catch (err) {
    console.error('Approve error:', err);
    return NextResponse.json({ success: false, error: 'Failed to approve' }, { status: 500 });
  }
}
