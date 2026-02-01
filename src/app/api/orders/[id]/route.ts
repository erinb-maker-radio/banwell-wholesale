import { NextResponse } from 'next/server';
import { createServerPB, authenticateAdmin } from '@/lib/pocketbase';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const pb = createServerPB();
    await authenticateAdmin(pb);

    const order = await pb.collection('orders').getOne(id, { expand: 'customer' });
    const items = await pb.collection('order_items').getFullList({
      filter: `order="${id}"`,
      expand: 'product',
    });

    return NextResponse.json({ success: true, data: { order, items } });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const pb = createServerPB();
    await authenticateAdmin(pb);

    const body = await request.json();
    const order = await pb.collection('orders').update(id, body);

    return NextResponse.json({ success: true, data: order });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 400 });
  }
}
