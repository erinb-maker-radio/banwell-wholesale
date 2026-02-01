import { NextResponse } from 'next/server';
import { createServerPB, authenticateAdmin } from '@/lib/pocketbase';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const pb = createServerPB();
    await authenticateAdmin(pb);

    const customer = await pb.collection('customers').getOne(id);

    // Get related data
    const orders = await pb.collection('orders').getFullList({
      filter: `customer="${id}"`,
      sort: '-created',
    });

    const communications = await pb.collection('communications').getFullList({
      filter: `customer="${id}"`,
      sort: '-date',
    });

    const curated = await pb.collection('curated_products').getFullList({
      filter: `customer="${id}"`,
      expand: 'product',
      sort: 'sort_order',
    });

    return NextResponse.json({
      success: true,
      data: { customer, orders, communications, curated },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const pb = createServerPB();
    await authenticateAdmin(pb);

    const body = await request.json();
    const customer = await pb.collection('customers').update(id, body);

    return NextResponse.json({ success: true, data: customer });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to update customer' }, { status: 400 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const pb = createServerPB();
    await authenticateAdmin(pb);

    await pb.collection('customers').delete(id);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to delete customer' }, { status: 400 });
  }
}
