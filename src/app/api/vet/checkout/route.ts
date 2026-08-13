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

// POST /api/vet/checkout
// Body: { slug, size, customerName, customerEmail }
// Creates a Square payment link and a vet_orders PB record.
// Returns { checkoutUrl }
export async function POST(request: Request) {
  try {
    const { slug, size, customerName, customerEmail } = await request.json();

    if (!slug || !size || !SIZES[size]) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

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
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://wholesale.banwelldesigns.com';
    const redirectUrl = `${baseUrl}/portrait/${slug}/thank-you`;

    // Create Square payment link using `order` (not `quickPay`) so we can
    // embed the clinic slug as referenceId for tracking in the Square dashboard.
    // quickPay and order are mutually exclusive in the Square SDK.
    const squareResponse = await squareClient.checkout.paymentLinks.create({
      idempotencyKey: `vet-${slug}-${size}-${Date.now()}`,
      description: `Custom pet portrait suncatcher (${size}) — referred by ${slug}`,
      checkoutOptions: {
        redirectUrl,
        askForShippingAddress: true,
      },
      // Pre-populate buyer email when provided
      ...(customerEmail
        ? { prePopulatedData: { buyerEmail: customerEmail } }
        : {}),
      order: {
        locationId,
        referenceId: `vet-${slug}`,
        lineItems: [
          {
            name: sizeInfo.label,
            quantity: '1',
            basePriceMoney: {
              amount: BigInt(sizeInfo.cents),
              currency: 'USD',
            },
            note: `Referred by clinic: ${slug}. Photo collected via email after payment.`,
          },
        ],
      },
    });

    const checkoutUrl = squareResponse.paymentLink?.url;
    const squareOrderId = squareResponse.paymentLink?.orderId || '';
    const paymentLinkId = squareResponse.paymentLink?.id || '';

    // Create pending vet_orders record
    await pb.collection('vet_orders').create({
      clinic: clinicId,
      square_order_id: squareOrderId,
      square_payment_link: checkoutUrl || '',
      customer_name: customerName || '',
      customer_email: customerEmail || '',
      size,
      amount_cents: sizeInfo.cents,
      commission_cents: COMMISSION_CENTS,
      status: 'pending_payment',
      photo_received: false,
    });

    return NextResponse.json({ checkoutUrl });
  } catch (err) {
    console.error('[vet/checkout] error:', err);
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
