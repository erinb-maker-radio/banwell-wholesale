import { NextResponse } from 'next/server';
import { getAuthenticatedPB } from '@/lib/auth';
import { createServerPB, authenticateAdmin } from '@/lib/pocketbase';

// Customer-scoped order detail. The orders viewRule is `customer = @request.auth.id`,
// so the customer-authed getOne returns the record only if it belongs to them.
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getAuthenticatedPB();
  if (!auth) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  try {
    const { id } = await params;

    // Scoped read — throws 404 if the order isn't this customer's.
    const order = await auth.pb.collection('orders').getOne(id);
    if (order.customer !== auth.customerId) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Items via admin (order_items list rules may be stricter); ownership already verified.
    const adminPb = createServerPB();
    await authenticateAdmin(adminPb);
    const items = await adminPb.collection('order_items').getFullList({
      filter: `order="${id}"`,
      expand: 'product',
    });

    return NextResponse.json({ order, items });
  } catch (err) {
    console.error('Order detail load failed:', err);
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }
}
