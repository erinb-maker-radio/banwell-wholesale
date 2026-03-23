import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedPB } from '@/lib/auth';

export async function GET() {
  const auth = await getAuthenticatedPB();
  if (!auth) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  try {
    const records = await auth.pb.collection('favorites').getFullList({
      filter: `customer="${auth.customerId}"`,
      expand: 'product',
      sort: '-created',
    });

    const favorites = records
      .map(r => ({ id: r.id, product: r.expand?.product }))
      .filter(f => f.product);

    return NextResponse.json({ favorites });
  } catch (err) {
    console.error('Failed to load favorites:', err);
    return NextResponse.json({ error: 'Failed to load favorites' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const auth = await getAuthenticatedPB();
  if (!auth) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  try {
    const { favoriteId } = await req.json();
    if (!favoriteId) return NextResponse.json({ error: 'Missing favoriteId' }, { status: 400 });

    // Verify the favorite belongs to this customer
    const fav = await auth.pb.collection('favorites').getOne(favoriteId);
    if (fav.customer !== auth.customerId) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    await auth.pb.collection('favorites').delete(favoriteId);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Failed to delete favorite:', err);
    return NextResponse.json({ error: 'Failed to delete favorite' }, { status: 500 });
  }
}
