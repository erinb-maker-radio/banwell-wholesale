import { NextRequest, NextResponse } from 'next/server';
import { createServerPB, authenticateAdmin } from '@/lib/pocketbase';

// Forward-only pipeline order. Higher index = further along. Terminal statuses
// (converted, declined, dead) are special — transitions TO them are always allowed
// (from any non-terminal status), transitions FROM them require ?force=true.
const STATUS_ORDER = [
  'researched',
  'verified',
  'qualified',
  'outreach_drafted',
  'outreach_approved',
  'contacted',
  'replied',
  'application_required',
  'application_submitted',
  'samples_requested',
  'samples_sent',
  'follow_up_1',
  'follow_up_2',
  'follow_up_3',
];
const TERMINAL_STATUSES = new Set(['converted', 'declined', 'dead']);

function statusRank(status: string): number {
  const idx = STATUS_ORDER.indexOf(status);
  return idx === -1 ? -1 : idx;
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const pb = createServerPB();
    await authenticateAdmin(pb);

    const body = await req.json();
    const force = req.nextUrl.searchParams.get('force') === 'true';

    // Status transition guard: reject backward moves unless ?force=true.
    if (typeof body.status === 'string') {
      const current = await pb.collection('wholesale_leads').getOne(id, { fields: 'status' });
      const from = current.status as string;
      const to = body.status;

      if (from !== to && !force) {
        const fromTerminal = TERMINAL_STATUSES.has(from);
        const toTerminal = TERMINAL_STATUSES.has(to);

        // Always allow non-terminal → terminal (e.g. anything → dead/converted/declined)
        if (!toTerminal) {
          // Block transitions from terminal unless forced
          if (fromTerminal) {
            return NextResponse.json({
              error: `Refusing to revive lead from terminal status "${from}" → "${to}". Add ?force=true to override.`,
            }, { status: 400 });
          }
          // Block backward moves in the main pipeline
          const fromRank = statusRank(from);
          const toRank = statusRank(to);
          if (fromRank !== -1 && toRank !== -1 && toRank < fromRank) {
            return NextResponse.json({
              error: `Refusing backward status transition "${from}" → "${to}". Add ?force=true to override (e.g. for intentional re-drafts).`,
            }, { status: 400 });
          }
        }
      }
    }

    const record = await pb.collection('wholesale_leads').update(id, body);
    return NextResponse.json({ success: true, data: record });
  } catch (err) {
    console.error('Lead update error:', err);
    return NextResponse.json({ error: 'Failed to update lead' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const pb = createServerPB();
    await authenticateAdmin(pb);

    await pb.collection('wholesale_leads').delete(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Lead delete error:', err);
    return NextResponse.json({ error: 'Failed to delete lead' }, { status: 500 });
  }
}
