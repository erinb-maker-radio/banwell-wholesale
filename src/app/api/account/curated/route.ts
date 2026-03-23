import { NextResponse } from 'next/server';
import { getAuthenticatedPB } from '@/lib/auth';

export async function GET() {
  const auth = await getAuthenticatedPB();
  if (!auth) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  try {
    const records = await auth.pb.collection('curated_products').getFullList({
      filter: `customer="${auth.customerId}"`,
      expand: 'product',
      sort: 'sort_order',
    });

    const products = records
      .map(r => r.expand?.product)
      .filter(Boolean);

    return NextResponse.json({ products });
  } catch (err) {
    console.error('Failed to load curated products:', err);
    return NextResponse.json({ error: 'Failed to load catalog' }, { status: 500 });
  }
}
