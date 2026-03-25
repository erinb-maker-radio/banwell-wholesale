import { NextResponse } from 'next/server';
import { createServerPB, authenticateAdmin } from '@/lib/pocketbase';
import { calculateDiscount } from '@/lib/pricing';
import { generateOrderNumber } from '@/lib/utils';
import { createCheckoutLink } from '@/lib/square';
import { notifyOrderPlaced } from '@/lib/notifications';
import { isValidCode, getCodeDiscount } from '@/lib/discount-codes';
import { getAuthenticatedPB } from '@/lib/auth';

async function pbFetch(path: string, token: string, options: RequestInit = {}) {
  const pbUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'https://pb.banwelldesigns.com';
  const res = await fetch(`${pbUrl}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`PB ${options.method || 'GET'} ${path} failed (${res.status}): ${body}`);
  }
  return res.json();
}

export async function POST(request: Request) {
  let step = 'init';
  try {
    step = 'auth';
    const auth = await getAuthenticatedPB();
    if (!auth) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    step = 'load customer';
    const customerId = auth.customerId;
    const customer = await auth.pb.collection('customers').getOne(customerId);

    const { items, discountCode } = await request.json();
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    step = 'admin auth';
    const adminPb = createServerPB();
    await authenticateAdmin(adminPb);
    const adminToken = adminPb.authStore.token;

    step = 'load products';
    let subtotal = 0;
    const lineItems = [];

    for (const item of items) {
      const product = await pbFetch(
        `/api/collections/products/records/${item.productId}`,
        adminToken
      );
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

    step = 'calculate discount';
    const tierDiscount = calculateDiscount(subtotal, customer.discount_tier || 'auto');

    let codeDiscountAmount = 0;
    if (discountCode && isValidCode(discountCode)) {
      const pct = getCodeDiscount(discountCode);
      codeDiscountAmount = Math.round(tierDiscount.total * (pct / 100));
    }

    const discount = {
      percent: tierDiscount.percent,
      amount: tierDiscount.amount + codeDiscountAmount,
      total: tierDiscount.total - codeDiscountAmount,
      tierName: tierDiscount.tierName,
    };

    step = 'generate order number';
    const year = new Date().getFullYear();
    const existingOrders = await pbFetch(
      '/api/collections/orders/records?perPage=1',
      adminToken
    );
    const seq = (existingOrders.totalItems || 0) + 1;
    const orderNumber = generateOrderNumber(year, seq);

    step = 'create order record';
    const order = await pbFetch('/api/collections/orders/records', adminToken, {
      method: 'POST',
      body: JSON.stringify({
        order_number: orderNumber,
        customer: customerId,
        status: 'pending_payment',
        payment_method: 'square',
        subtotal,
        discount_percent: discount.percent,
        discount_amount: discount.amount,
        total: discount.total,
        follow_up_sent: false,
      }),
    });

    step = 'create order items';
    for (const li of lineItems) {
      await pbFetch('/api/collections/order_items/records', adminToken, {
        method: 'POST',
        body: JSON.stringify({
          order: order.id,
          product: li.productId,
          quantity: li.quantity,
          unit_price: li.unitPrice,
          line_total: li.lineTotal,
        }),
      });
    }

    step = 'square checkout';
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.banwelldesigns.com';

    const checkout = await createCheckoutLink({
      orderId: order.id,
      orderNumber,
      totalCents: discount.total,
      customerEmail: customer.email,
      lineItems: lineItems.map(li => ({ name: li.name, quantity: li.quantity, priceCents: li.priceCents })),
      redirectUrl: `${baseUrl}/account/checkout/thank-you?order=${orderNumber}`,
    });

    step = 'update order with checkout id';
    await pbFetch(`/api/collections/orders/records/${order.id}`, adminToken, {
      method: 'PATCH',
      body: JSON.stringify({ square_checkout_id: checkout.paymentLinkId }),
    });

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
  } catch (err: unknown) {
    console.error(`Checkout error at step "${step}":`, err);
    let message = 'Unknown error';
    if (err instanceof Error) {
      message = err.message;
    }
    return NextResponse.json({ error: `Checkout failed at ${step}: ${message}` }, { status: 500 });
  }
}
