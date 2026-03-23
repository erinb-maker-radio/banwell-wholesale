import { NextResponse } from 'next/server';
import { getAuthenticatedPB } from '@/lib/auth';

export async function GET() {
  const auth = await getAuthenticatedPB();
  if (!auth) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  try {
    const records = await auth.pb.collection('invoices').getFullList({
      filter: `customer="${auth.customerId}"`,
      sort: '-created',
      expand: 'order',
    });

    return NextResponse.json({ invoices: records });
  } catch (err) {
    console.error('Failed to load invoices:', err);
    return NextResponse.json({ error: 'Failed to load invoices' }, { status: 500 });
  }
}
