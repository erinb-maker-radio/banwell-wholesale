import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedPB } from '@/lib/auth';

// favorites rules are scoped by `customer = @request.auth.id` —
// customer-authed PB is what we want for all four ops.

export async function GET() {
  const auth = await getAuthenticatedPB();
  if (!auth) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  try {
    const records = await auth.pb.collection('favorites').getFullList({
      filter: `customer="${auth.customerId}"`,
      expand: 'product.category',
      sort: '-id',
    });

    const favorites = records
      .map(r => ({ id: r.id, product: r.expand?.product }))
      .filter(f => f.product);

    return NextResponse.json({ favorites });
  } catch (err) {
    const e = err as Error;
    console.error('Failed to load favorites:', err);
    return NextResponse.json({
      error: 'Failed to load favorites',
      detail: String(err),
      message: e?.message,
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await getAuthenticatedPB();
  if (!auth) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  try {
    const { productId } = await req.json();
    if (!productId) return NextResponse.json({ error: 'Missing productId' }, { status: 400 });

    const existing = await auth.pb.collection('favorites').getFullList({
      filter: `customer="${auth.customerId}" && product="${productId}"`,
    });
    if (existing.length > 0) {
      return NextResponse.json({ error: 'Already favorited' }, { status: 400 });
    }

    const fav = await auth.pb.collection('favorites').create({
      customer: auth.customerId,
      product: productId,
    });
    return NextResponse.json({ success: true, favoriteId: fav.id });
  } catch (err) {
    console.error('Failed to add favorite:', err);
    return NextResponse.json({ error: 'Failed to add favorite' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const auth = await getAuthenticatedPB();
  if (!auth) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  try {
    const { favoriteId } = await req.json();
    if (!favoriteId) return NextResponse.json({ error: 'Missing favoriteId' }, { status: 400 });

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
