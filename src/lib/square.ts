import { SquareClient, SquareEnvironment } from 'square';

// Initialize Square client
const squareClient = new SquareClient({
  token: process.env.SQUARE_ACCESS_TOKEN!,
  environment: process.env.SQUARE_ENVIRONMENT === 'production'
    ? SquareEnvironment.Production
    : SquareEnvironment.Sandbox,
});

export default squareClient;

// Get the primary location ID
let cachedLocationId: string | null = null;

export async function getLocationId(): Promise<string> {
  if (process.env.SQUARE_LOCATION_ID) {
    return process.env.SQUARE_LOCATION_ID;
  }

  if (cachedLocationId) return cachedLocationId;

  const response = await squareClient.locations.list();
  if (!response.locations || response.locations.length === 0) {
    throw new Error('No Square locations found');
  }

  cachedLocationId = response.locations[0].id!;
  return cachedLocationId;
}

// Create or get Square customer
export async function getOrCreateSquareCustomer(
  email: string,
  companyName: string,
  existingCustomerId?: string
): Promise<string> {
  if (existingCustomerId) {
    try {
      await squareClient.customers.get({ customerId: existingCustomerId });
      return existingCustomerId;
    } catch {
      // Customer not found, create new one
    }
  }

  const response = await squareClient.customers.create({
    emailAddress: email,
    companyName: companyName,
    idempotencyKey: `${companyName}-${Date.now()}`,
  });

  return response.customer!.id!;
}

// Create a Square checkout payment link for an order
export async function createCheckoutLink(params: {
  orderId: string;
  orderNumber: string;
  totalCents: number;
  customerEmail: string;
  lineItems: Array<{ name: string; quantity: number; priceCents: number }>;
  redirectUrl: string;
}): Promise<{ checkoutUrl: string; paymentLinkId: string }> {
  const locationId = await getLocationId();

  const response = await squareClient.checkout.paymentLinks.create({
    idempotencyKey: `wholesale-${params.orderId}-${Date.now()}`,
    description: `Wholesale order ${params.orderNumber}`,
    checkoutOptions: {
      redirectUrl: params.redirectUrl,
      askForShippingAddress: false,
    },
    quickPay: {
      name: `Order ${params.orderNumber}`,
      priceMoney: {
        amount: BigInt(params.totalCents),
        currency: 'USD',
      },
      locationId,
    },
  });

  return {
    checkoutUrl: response.paymentLink!.url!,
    paymentLinkId: response.paymentLink!.id!,
  };
}
