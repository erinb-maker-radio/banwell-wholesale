import { NextResponse } from 'next/server';
import { createServerPB, authenticateAdmin } from '@/lib/pocketbase';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const pb = createServerPB();
    await authenticateAdmin(pb);

    const curated = await pb.collection('curated_products').getFullList({
      filter: `customer="${id}"`,
      expand: 'product',
      sort: 'sort_order',
    });

    return NextResponse.json({ success: true, data: curated });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to load curated products' }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const pb = createServerPB();
    await authenticateAdmin(pb);

    const body = await request.json();
    const { productIds } = body;

    if (!Array.isArray(productIds)) {
      return NextResponse.json({ error: 'productIds array required' }, { status: 400 });
    }

    const created = [];
    for (let i = 0; i < productIds.length; i++) {
      // Check if already curated
      try {
        await pb.collection('curated_products').getFirstListItem(
          `customer="${id}" && product="${productIds[i]}"`
        );
        continue; // already exists
      } catch { /* not found, create */ }

      const record = await pb.collection('curated_products').create({
        customer: id,
        product: productIds[i],
        sort_order: i,
      });
      created.push(record);
    }

    return NextResponse.json({ success: true, data: created });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to add curated products' }, { status: 400 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const pb = createServerPB();
    await authenticateAdmin(pb);

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    if (productId) {
      // Remove specific product
      const record = await pb.collection('curated_products').getFirstListItem(
        `customer="${id}" && product="${productId}"`
      );
      await pb.collection('curated_products').delete(record.id);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to remove curated product' }, { status: 400 });
  }
}
