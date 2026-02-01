import { NextResponse } from 'next/server';
import { createServerPB, authenticateAdmin } from '@/lib/pocketbase';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const pb = createServerPB();
    await authenticateAdmin(pb);

    const product = await pb.collection('products').getOne(id, { expand: 'category' });
    return NextResponse.json({ success: true, data: product });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const pb = createServerPB();
    await authenticateAdmin(pb);

    const body = await request.json();
    const product = await pb.collection('products').update(id, body);

    return NextResponse.json({ success: true, data: product });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 400 });
  }
}
