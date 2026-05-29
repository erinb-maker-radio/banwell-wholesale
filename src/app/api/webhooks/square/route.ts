import { NextResponse } from 'next/server';
import { createServerPB, authenticateAdmin } from '@/lib/pocketbase';
import { notifyPaymentReceived } from '@/lib/notifications';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const eventType = body.type;

    console.log('Square webhook received:', eventType);

    // Square fires payment.created / payment.updated (there is no
    // "payment.completed"). Act once the payment reaches COMPLETED.
    if (eventType !== 'payment.updated' && eventType !== 'payment.created') {
      return NextResponse.json({ received: true });
    }

    const payment = body.data?.object?.payment;
    if (!payment) {
      console.log('No payment data in webhook');
      return NextResponse.json({ received: true });
    }
    if (payment.status !== 'COMPLETED') {
      console.log('Payment not completed yet:', payment.status);
      return NextResponse.json({ received: true });
    }

    const paymentId = payment.id;
    const pb = createServerPB();
    await authenticateAdmin(pb);

    // Correlate by the Square order_id we stored at checkout (payment objects
    // carry order_id, not payment_link_id). Fall back to payment_link_id.
    let order;
    try {
      const squareOrderId = payment.order_id;
      const paymentLinkId = payment.payment_link_id;
      if (squareOrderId) {
        try {
          order = await pb.collection('orders').getFirstListItem(
            `square_order_id="${squareOrderId}"`, { expand: 'customer' });
        } catch { /* fall through to payment_link_id */ }
      }
      if (!order && paymentLinkId) {
        order = await pb.collection('orders').getFirstListItem(
          `square_checkout_id="${paymentLinkId}"`, { expand: 'customer' });
      }
    } catch {
      console.log('No order found for payment', paymentId, 'order_id', payment.order_id);
      return NextResponse.json({ received: true });
    }

    if (!order) {
      console.log('No matching order found for webhook; payment', paymentId, 'order_id', payment.order_id);
      return NextResponse.json({ received: true });
    }

    // Idempotency: skip if already marked paid
    if (order.status === 'payment_received' || order.square_payment_id) {
      return NextResponse.json({ received: true, alreadyProcessed: true });
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
