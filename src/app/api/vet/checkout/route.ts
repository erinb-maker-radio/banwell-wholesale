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
    const { slug, size, customerName, customerEmail, origin } = await request.json();

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
      amount_cents: sizeInfo.cents,
      commission_cents: commissionCents,
      status: 'pending_payment',
      photo_received: false,
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
            name: sizeInfo.label,
            quantity: '1',
            basePriceMoney: {
              amount: BigInt(sizeInfo.cents),
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
