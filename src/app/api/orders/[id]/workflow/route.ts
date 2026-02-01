import { NextResponse } from 'next/server';
import { createServerPB, authenticateAdmin } from '@/lib/pocketbase';
import { notifyPaymentReceived, notifyOrderShipped } from '@/lib/notifications';

const VALID_TRANSITIONS: Record<string, string[]> = {
  pending_payment: ['payment_received'],
  payment_received: ['being_fulfilled'],
  being_fulfilled: ['shipped'],
  shipped: ['delivered'],
  delivered: ['follow_up'],
};

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const pb = createServerPB();
    await authenticateAdmin(pb);

    const { status, tracking_number } = await request.json();
    const order = await pb.collection('orders').getOne(id, { expand: 'customer' });

    // Validate transition
    const allowed = VALID_TRANSITIONS[order.status] || [];
    if (!allowed.includes(status)) {
      return NextResponse.json(
        { error: `Cannot transition from ${order.status} to ${status}` },
        { status: 400 }
      );
    }

    const updates: Record<string, unknown> = { status };

    if (status === 'shipped') {
      updates.shipped_date = new Date().toISOString();
      if (tracking_number) updates.tracking_number = tracking_number;
    }

    if (status === 'delivered') {
      updates.delivered_date = new Date().toISOString();
      // Set follow-up 30 days from now
      const followUp = new Date();
      followUp.setDate(followUp.getDate() + 30);
      updates.follow_up_date = followUp.toISOString();
    }

    const updated = await pb.collection('orders').update(id, updates);

    // Log communication
    await pb.collection('communications').create({
      customer: order.customer,
      type: status === 'shipped' ? 'shipped' : status === 'payment_received' ? 'payment_received' : 'note',
      subject: `Order ${order.order_number} - ${status.replace(/_/g, ' ')}`,
      content: `Order status updated to: ${status}`,
      date: new Date().toISOString(),
      logged_by: 'admin',
    });

    // Send notifications
    const customer = order.expand?.customer;
    if (customer) {
      if (status === 'payment_received') {
        notifyPaymentReceived({
          orderNumber: order.order_number,
          customerEmail: customer.email,
          contactName: customer.contact_name,
          total: order.total,
        }).catch(console.error);
      }
      if (status === 'shipped') {
        notifyOrderShipped({
          orderNumber: order.order_number,
          customerEmail: customer.email,
          contactName: customer.contact_name,
          trackingNumber: tracking_number,
        }).catch(console.error);
      }
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to update workflow' }, { status: 400 });
  }
}
