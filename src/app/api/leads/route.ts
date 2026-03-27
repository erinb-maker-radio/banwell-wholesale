import { NextRequest, NextResponse } from 'next/server';
import { createServerPB, authenticateAdmin } from '@/lib/pocketbase';

export async function GET(req: NextRequest) {
  try {
    const pb = createServerPB();
    await authenticateAdmin(pb);

    const status = req.nextUrl.searchParams.get('status');
    const shopType = req.nextUrl.searchParams.get('shop_type');
    const productFit = req.nextUrl.searchParams.get('product_fit');

    let filter = '';
    const filters: string[] = [];
    if (status && status !== 'all') filters.push(`status="${status}"`);
    if (shopType && shopType !== 'all') filters.push(`shop_type="${shopType}"`);
    if (productFit && productFit !== 'all') filters.push(`product_fit~"${productFit}"`);
    if (filters.length) filter = filters.join(' && ');

    const records = await pb.collection('wholesale_leads').getFullList({
      filter: filter || undefined,
      sort: '-created',
    });

    return NextResponse.json({ success: true, data: records });
  } catch (err) {
    console.error('Leads fetch error:', err);
    return NextResponse.json({ error: 'Failed to load leads' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const pb = createServerPB();
    await authenticateAdmin(pb);

    const body = await req.json();
    const record = await pb.collection('wholesale_leads').create(body);
    return NextResponse.json({ success: true, data: record });
  } catch (err) {
    console.error('Lead create error:', err);
    return NextResponse.json({ error: 'Failed to create lead' }, { status: 500 });
  }
}
