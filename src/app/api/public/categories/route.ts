import { NextResponse } from 'next/server';
import { createServerPB } from '@/lib/pocketbase';

export async function GET() {
  try {
    const pb = createServerPB();
    const categories = await pb.collection('product_categories').getFullList({
      sort: 'sort_order',
    });

    return NextResponse.json({ success: true, data: categories });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to load categories' }, { status: 500 });
  }
}
