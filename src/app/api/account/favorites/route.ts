import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedPB } from '@/lib/auth';
import { createServerPB, authenticateAdmin } from '@/lib/pocketbase';

// favorites has listRule/viewRule/createRule/deleteRule = null (admin-only).
// All operations use admin-authed PB; auth.customerId scopes ownership.

export async function GET() {
  const auth = await getAuthenticatedPB();
  if (!auth) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  try {
    const adminPb = createServerPB();
    await authenticateAdmin(adminPb);

    const records = await adminPb.collection('favorites').getFullList({
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

export async function POST(req: NextRequest) {
  const auth = await getAuthenticatedPB();
  if (!auth) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  try {
    const { productId } = await req.json();
    if (!productId) return NextResponse.json({ error: 'Missing productId' }, { status: 400 });

    const adminPb = createServerPB();
    await authenticateAdmin(adminPb);

    const existing = await adminPb.collection('favorites').getFullList({
      filter: `customer="${auth.customerId}" && product="${productId}"`,
    });
    if (existing.length > 0) {
      return NextResponse.json({ error: 'Already favorited' }, { status: 400 });
    }

    const fav = await adminPb.collection('favorites').create({
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

    const adminPb = createServerPB();
    await authenticateAdmin(adminPb);

    const fav = await adminPb.collection('favorites').getOne(favoriteId);
    if (fav.customer !== auth.customerId) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    await adminPb.collection('favorites').delete(favoriteId);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Failed to delete favorite:', err);
    return NextResponse.json({ error: 'Failed to delete favorite' }, { status: 500 });
  }
}
