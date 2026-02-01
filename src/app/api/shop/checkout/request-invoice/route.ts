import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerPB, authenticateAdmin } from '@/lib/pocketbase';
import { calculateDiscount } from '@/lib/pricing';
import { generateOrderNumber, generateInvoiceNumber } from '@/lib/utils';
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

    const adminPb = createServerPB();
    await authenticateAdmin(adminPb);

    // Calculate totals
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
      payment_method: 'invoice',
      subtotal,
      discount_percent: discount.percent,
      discount_amount: discount.amount,
      total: discount.total,
      invoice_terms: 'net30',
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

    // Create invoice
    const existingInvoices = await adminPb.collection('invoices').getList(1, 1, { sort: '-created' });
    const invSeq = existingInvoices.totalItems + 1;
    const invoiceNumber = generateInvoiceNumber(year, invSeq);

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);

    await adminPb.collection('invoices').create({
      order: order.id,
      customer: customerId,
      invoice_number: invoiceNumber,
      amount: discount.total,
      due_date: dueDate.toISOString(),
      status: 'draft',
    });

    // Log communication
    await adminPb.collection('communications').create({
      customer: customerId,
      type: 'order_placed',
      subject: `Order ${orderNumber} placed (invoice)`,
      content: `Order placed with invoice payment. Invoice: ${invoiceNumber}. Total: $${(discount.total / 100).toFixed(2)}`,
      date: new Date().toISOString(),
      logged_by: 'system',
    });

    // Notify
    notifyOrderPlaced({
      orderNumber,
      businessName: customer.business_name,
      contactName: customer.contact_name,
      customerEmail: customer.email,
      total: discount.total,
      itemCount: lineItems.reduce((s, i) => s + i.quantity, 0),
      paymentMethod: 'invoice',
    }).catch(console.error);

    return NextResponse.json({
      success: true,
      orderNumber,
      invoiceNumber,
    });
  } catch (err) {
    console.error('Invoice checkout error:', err);
    return NextResponse.json({ error: 'Checkout failed' }, { status: 500 });
  }
}
