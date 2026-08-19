import { NextResponse } from 'next/server';
import { createServerPB, authenticateAdmin } from '@/lib/pocketbase';
import squareClient, { getLocationId } from '@/lib/square';

// Prices in cents — DTC retail, locked 2026-07-13
const SIZES: Record<string, { label: string; cents: number }> = {
  '3"':  { label: '3" Custom Pet Portrait Suncatcher',  cents: 13500 },
  '6"':  { label: '6" Custom Pet Portrait Suncatcher',  cents: 17200 },
  '10"': { label: '10" Custom Pet Portrait Suncatcher', cents: 19800 },
  '12"': { label: '12" Custom Pet Portrait Suncatcher', cents: 22900 },
  '15"': { label: '15" Custom Pet Portrait Suncatcher', cents: 25300 },
};

const COMMISSION_CENTS = 2000; // $20 flat per order

// Promo codes, validated server-side. Percentages are Erin-approved before any
// code is printed/sent. WELCOME25 honors the 25%-off promised to the 8 Etsy
// UGC-outreach customers (2026-08-13); GLASS15 is the package-insert code.
const PROMOS: Record<string, number> = {
  GLASS15: 0.15,
  WELCOME25: 0.25,
  // 99%-off comp code — for test orders / full end-to-end checkout runs
  // without paying retail. Erin-approved 2026-08-19.
  TESTRUN99: 0.99,
};

// Hosts we allow buyers to be redirected back to after Square checkout. The
// general SEO page lives on stainedglassportraits.com, so a direct order there
// should return the buyer to that same host rather than the wholesale domain.
const ALLOWED_ORIGINS = new Set([
  'https://stainedglassportraits.com',
  'https://www.stainedglassportraits.com',
  'https://banwelldesigns.com',
  'https://www.banwelldesigns.com',
  'https://wholesale.banwelldesigns.com',
]);

// POST /api/vet/checkout
// Body: { slug, size, customerName, customerEmail, origin? }
// slug="direct" tags a non-referral (direct-to-consumer) sale: zero commission.
// Creates a Square payment link and a vet_orders PB record.
// Returns { checkoutUrl }
export async function POST(request: Request) {
  try {
    const { slug, size, customerName, customerEmail, origin, promo, isGift, giftNote } =
      await request.json();

    if (!slug || !size || !SIZES[size]) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    // Email is required — it's the only way we reach the buyer to send the
    // artwork proof. Enforce server-side so a malformed client can't skip it.
    const email = typeof customerEmail === 'string' ? customerEmail.trim() : '';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'A valid email is required so we can send your artwork proof.' },
        { status: 400 },
      );
    }

    const isDirect = slug === 'direct';
    const commissionCents = isDirect ? 0 : COMMISSION_CENTS;

    const sizeInfo = SIZES[size];

    // Promo: unknown codes get a friendly error rather than silently charging
    // full price — the buyer typed it expecting a discount.
    const promoCode = typeof promo === 'string' ? promo.trim().toUpperCase() : '';
    if (promoCode && !(promoCode in PROMOS)) {
      return NextResponse.json(
        { error: 'That promo code isn\u2019t valid. Check the spelling, or order without it.' },
        { status: 400 },
      );
    }
    const discount = promoCode ? PROMOS[promoCode] : 0;
    const chargeCents = Math.round(sizeInfo.cents * (1 - discount));

    const pb = createServerPB();
    await authenticateAdmin(pb);

    // Look up clinic
    let clinicId: string | null = null;
    try {
      const results = await pb.collection('vet_clinics').getList(1, 1, {
        filter: `slug="${slug}"`,
      });
      if (results.items[0]) clinicId = results.items[0].id;
    } catch {
      // No clinic record yet — still create the order
    }

    // If no clinic record, create a stub so the order has a parent
    if (!clinicId) {
      const clinic = await pb.collection('vet_clinics').create({
        slug,
        name: slug,
        scan_count: 0,
        demo_sent: false,
        display_active: false,
        angel_fund: false,
      });
      clinicId = clinic.id;
    }

    const locationId = await getLocationId();
    // Keep the buyer on the host they started from when it's a trusted origin
    // (e.g. stainedglassportraits.com), otherwise fall back to the base URL.
    const baseUrl =
      origin && ALLOWED_ORIGINS.has(origin)
        ? origin
        : process.env.NEXT_PUBLIC_BASE_URL || 'https://wholesale.banwelldesigns.com';

    // Create the PB order BEFORE the payment link so the thank-you redirect can
    // carry the order id (?o=) — that's what lets the buyer upload their photo
    // immediately instead of waiting for a manual email round-trip (which is
    // exactly the step where orders have stalled before).
    const pbOrder = await pb.collection('vet_orders').create({
      clinic: clinicId,
      square_order_id: '',
      square_payment_link: '',
      customer_name: customerName || '',
      customer_email: email,
      size,
      amount_cents: chargeCents,
      commission_cents: commissionCents,
      status: 'pending_payment',
      photo_received: false,
      is_gift: !!isGift,
      gift_note: typeof giftNote === 'string' ? giftNote.slice(0, 500) : '',
      promo_code: promoCode,
    });

    const redirectUrl = `${baseUrl}/portrait/${slug}/thank-you?o=${pbOrder.id}`;

    // Create Square payment link using `order` (not `quickPay`) so we can
    // embed the clinic slug as referenceId for tracking in the Square dashboard.
    // quickPay and order are mutually exclusive in the Square SDK.
    const squareResponse = await squareClient.checkout.paymentLinks.create({
      idempotencyKey: `vet-${slug}-${size}-${Date.now()}`,
      description: isDirect
        ? `Custom pet portrait suncatcher (${size}) — direct order`
        : `Custom pet portrait suncatcher (${size}) — referred by ${slug}`,
      checkoutOptions: {
        redirectUrl,
        askForShippingAddress: true,
      },
      // Pre-populate buyer email when provided
      prePopulatedData: { buyerEmail: email },
      order: {
        locationId,
        referenceId: isDirect ? 'direct' : `vet-${slug}`,
        lineItems: [
          {
            name: promoCode ? `${sizeInfo.label} (promo ${promoCode})` : sizeInfo.label,
            quantity: '1',
            basePriceMoney: {
              amount: BigInt(chargeCents),
              currency: 'USD',
            },
            note: isDirect
              ? 'Direct order. Photo collected via email after payment.'
              : `Referred by clinic: ${slug}. Photo collected via email after payment.`,
          },
        ],
      },
    });

    const checkoutUrl = squareResponse.paymentLink?.url;
    const squareOrderId = squareResponse.paymentLink?.orderId || '';

    // Attach the Square identifiers to the pending record created above.
    await pb.collection('vet_orders').update(pbOrder.id, {
      square_order_id: squareOrderId,
      square_payment_link: checkoutUrl || '',
    });

    return NextResponse.json({ checkoutUrl });
  } catch (err) {
    console.error('[vet/checkout] error:', err);
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
