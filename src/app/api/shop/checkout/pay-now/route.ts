import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerPB, authenticateAdmin } from '@/lib/pocketbase';
import { calculateDiscount } from '@/lib/pricing';
import { generateOrderNumber } from '@/lib/utils';
import { createCheckoutLink } from '@/lib/square';
import { notifyOrderPlaced } from '@/lib/notifications';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const authCookie = cookieStore.get('pb_auth');
    if (!authCookie?.value) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const pb = createServerPB();
    pb.authStore.save(authCookie.value);
    if (!pb.authStore.isValid) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const customerId = pb.authStore.record?.id;
    const customer = await pb.collection('customers').getOne(customerId!);

    const { items } = await request.json();
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    // Authenticate as admin for writes
    const adminPb = createServerPB();
    await authenticateAdmin(adminPb);

    // Load products and calculate totals
    let subtotal = 0;
    const lineItems = [];

    for (const item of items) {
      const product = await adminPb.collection('products').getOne(item.productId);
      const lineTotal = product.retail_price * item.quantity;
      subtotal += lineTotal;
      lineItems.push({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: product.retail_price,
        lineTotal,
        name: product.short_title || product.title,
        priceCents: product.retail_price,
      });
    }

    const discount = calculateDiscount(subtotal, customer.discount_tier || 'auto');

    // Generate order number
    const year = new Date().getFullYear();
    const existingOrders = await adminPb.collection('orders').getList(1, 1, { sort: '-created' });
    const seq = existingOrders.totalItems + 1;
    const orderNumber = generateOrderNumber(year, seq);

    // Create order
    const order = await adminPb.collection('orders').create({
      order_number: orderNumber,
      customer: customerId,
      status: 'pending_payment',
      payment_method: 'square',
      subtotal,
      discount_percent: discount.percent,
      discount_amount: discount.amount,
      total: discount.total,
      follow_up_sent: false,
    });

    // Create order items
    for (const li of lineItems) {
      await adminPb.collection('order_items').create({
        order: order.id,
        product: li.productId,
        quantity: li.quantity,
        unit_price: li.unitPrice,
        line_total: li.lineTotal,
      });
    }

    // Create Square checkout link
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    try {
      const checkout = await createCheckoutLink({
        orderId: order.id,
        orderNumber,
        totalCents: discount.total,
        customerEmail: customer.email,
        lineItems: lineItems.map(li => ({ name: li.name, quantity: li.quantity, priceCents: li.priceCents })),
        redirectUrl: `${baseUrl}/account/checkout/thank-you?order=${orderNumber}`,
      });

      await adminPb.collection('orders').update(order.id, {
        square_checkout_id: checkout.paymentLinkId,
      });

      // Notify
      notifyOrderPlaced({
        orderNumber,
        businessName: customer.business_name,
        contactName: customer.contact_name,
        customerEmail: customer.email,
        total: discount.total,
        itemCount: lineItems.reduce((s, i) => s + i.quantity, 0),
        paymentMethod: 'square',
      }).catch(console.error);

      return NextResponse.json({
        success: true,
        checkoutUrl: checkout.checkoutUrl,
        orderNumber,
      });
    } catch (squareErr) {
      console.error('Square checkout error:', squareErr);
      return NextResponse.json({ error: 'Payment system error. Please try invoice payment.' }, { status: 500 });
    }
  } catch (err) {
    console.error('Checkout error:', err);
    return NextResponse.json({ error: 'Checkout failed' }, { status: 500 });
  }
}
