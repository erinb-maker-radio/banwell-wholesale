import { NextRequest, NextResponse } from 'next/server';
import { createServerPB, authenticateAdmin } from '@/lib/pocketbase';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const pb = createServerPB();
    await authenticateAdmin(pb);

    const body = await req.json();
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
