import { NextResponse } from 'next/server';
import { createServerPB, authenticateAdmin } from '@/lib/pocketbase';
import { notifyPaymentReceived } from '@/lib/notifications';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const eventType = body.type;

    console.log('Square webhook received:', eventType);

    if (eventType !== 'payment.completed' && eventType !== 'payment.updated') {
      return NextResponse.json({ received: true });
    }

    const payment = body.data?.object?.payment;
    if (!payment) {
      console.log('No payment data in webhook');
      return NextResponse.json({ received: true });
    }

    const paymentId = payment.id;
    const pb = createServerPB();
    await authenticateAdmin(pb);

    // Find order by square_checkout_id or pending payment
    let order;
    try {
      // Try to find by checkout ID from payment link
      const checkoutId = payment.payment_link_id;
      if (checkoutId) {
        order = await pb.collection('orders').getFirstListItem(
          `square_checkout_id="${checkoutId}" && status="pending_payment"`,
          { expand: 'customer' }
        );
      }
    } catch {
      console.log('No order found for payment link:', payment.payment_link_id);
      return NextResponse.json({ received: true });
    }

    if (!order) {
      console.log('No matching order found for webhook');
      return NextResponse.json({ received: true });
    }

    // Update order status
    await pb.collection('orders').update(order.id, {
      status: 'payment_received',
      square_payment_id: paymentId,
    });

    // Log communication
    await pb.collection('communications').create({
      customer: order.customer,
      type: 'payment_received',
      subject: `Payment received for ${order.order_number}`,
      content: `Square payment ${paymentId} completed. Amount: $${(order.total / 100).toFixed(2)}`,
      date: new Date().toISOString(),
      logged_by: 'system',
    });

    // Notify customer
    const customer = order.expand?.customer;
    if (customer) {
      notifyPaymentReceived({
        orderNumber: order.order_number,
        customerEmail: customer.email,
        contactName: customer.contact_name,
        total: order.total,
      }).catch(console.error);
    }

    return NextResponse.json({ received: true, orderId: order.id });
  } catch (err) {
    console.error('Webhook error:', err);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
