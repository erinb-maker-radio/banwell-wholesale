import { NextResponse } from 'next/server';
import { createServerPB, authenticateAdmin } from '@/lib/pocketbase';
import { calculateDiscount } from '@/lib/pricing';
import { generateOrderNumber, generateInvoiceNumber } from '@/lib/utils';
import { notifyOrderPlaced } from '@/lib/notifications';
import { isValidCode, getCodeDiscount } from '@/lib/discount-codes';
import { getAuthenticatedPB } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const auth = await getAuthenticatedPB();
    if (!auth) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const customerId = auth.customerId;
    const customer = await auth.pb.collection('customers').getOne(customerId);

    const { items, discountCode } = await request.json();
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

    const tierDiscount = calculateDiscount(subtotal, customer.discount_tier || 'auto');

    // Apply coupon code on top of tier discount (stacked)
    let codeDiscountAmount = 0;
    if (discountCode && isValidCode(discountCode)) {
      const codePercent = getCodeDiscount(discountCode);
      codeDiscountAmount = Math.round(tierDiscount.total * (codePercent / 100));
    }

    const totalDiscountAmount = tierDiscount.amount + codeDiscountAmount;
    const finalTotal = tierDiscount.total - codeDiscountAmount;

    const discount = {
      percent: tierDiscount.percent,
      amount: totalDiscountAmount,
      total: finalTotal,
      tierName: tierDiscount.tierName,
    };

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

    // Note: WELCOME25 is a universal Etsy coupon code, no per-subscriber tracking needed

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
    const message = err instanceof Error ? err.message : 'Checkout failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
