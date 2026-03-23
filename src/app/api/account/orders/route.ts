import { NextResponse } from 'next/server';
import { getAuthenticatedPB } from '@/lib/auth';

export async function GET() {
  const auth = await getAuthenticatedPB();
  if (!auth) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  try {
    const records = await auth.pb.collection('orders').getFullList({
      filter: `customer="${auth.customerId}"`,
      sort: '-created',
    });

    return NextResponse.json({ orders: records });
  } catch (err) {
    console.error('Failed to load orders:', err);
    return NextResponse.json({ error: 'Failed to load orders' }, { status: 500 });
  }
}
