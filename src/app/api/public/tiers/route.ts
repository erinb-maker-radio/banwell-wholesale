import { NextResponse } from 'next/server';
import { createServerPB } from '@/lib/pocketbase';

export async function GET() {
  try {
    const pb = createServerPB();
    const tiers = await pb.collection('discount_tiers').getFullList({
      filter: 'is_active=true',
      sort: 'min_order_amount',
    });

    return NextResponse.json({ success: true, data: tiers });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to load tiers' }, { status: 500 });
  }
}
