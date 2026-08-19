// Square payment reconcile — safety net for dropped webhooks.
//
// The Square webhook is the primary path that flips a vet_order from
// pending_payment -> paid. Webhooks can be dropped (delivery failure, a
// deploy bouncing the server mid-POST, a subscription hiccup). This job is
// the backstop: every 15 minutes it re-checks each pending_payment order
// directly against the live Square API and, if Square says the money moved,
// sets status=paid and fills in square_payment_id.
//
// Idempotent and conservative:
//   - Only ever flips pending_payment -> paid (never the reverse).
//   - Skips orders younger than 2 minutes so the webhook gets first crack.
//   - Anything ambiguous from Square is left untouched and retried next run.
//   - No emails, no side effects beyond the status/payment-id update.
//
// Run via cron:
//   cd /var/www/banwell-wholesale/app && node scripts/square-reconcile.mjs

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const appDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const env = {};
for (const line of fs.readFileSync(path.join(appDir, '.env.local'), 'utf8').split('\n')) {
  const m = line.match(/^([A-Z_]+)=(.*)$/);
  if (m) env[m[1]] = m[2];
}

const PB_URL = 'http://127.0.0.1:8094';
const SQUARE_BASE =
  env.SQUARE_ENVIRONMENT === 'sandbox'
    ? 'https://connect.squareupsandbox.com'
    : 'https://connect.squareup.com';
const MIN_AGE_MS = 2 * 60 * 1000; // let the webhook win for the first 2 min

function log(msg) {
  console.log(`[${new Date().toISOString()}] ${msg}`);
}

async function pbAuth() {
  const res = await fetch(`${PB_URL}/api/collections/_superusers/auth-with-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      identity: env.POCKETBASE_ADMIN_EMAIL,
      password: env.POCKETBASE_ADMIN_PASSWORD,
    }),
  });
  const data = await res.json();
  if (!data.token) throw new Error('PocketBase auth failed');
  return data.token;
}

// Returns { state: 'paid'|'unpaid'|'unknown', paymentId } for a Square order.
async function squarePayment(squareOrderId) {
  if (!squareOrderId) return { state: 'unknown' };
  try {
    const res = await fetch(`${SQUARE_BASE}/v2/orders/${squareOrderId}`, {
      headers: {
        Authorization: `Bearer ${env.SQUARE_ACCESS_TOKEN}`,
        'Square-Version': '2024-06-04',
      },
    });
    if (!res.ok) return { state: 'unknown' };
    const order = (await res.json()).order;
    if (!order) return { state: 'unknown' };
    const tenders = order.tenders || [];
    if (tenders.length > 0) {
      // A tender means money moved; prefer its payment_id.
      const paymentId = tenders[0].payment_id || tenders[0].id;
      return { state: 'paid', paymentId };
    }
    if (order.state === 'COMPLETED') return { state: 'paid' };
    if (['OPEN', 'DRAFT', 'CANCELED'].includes(order.state)) return { state: 'unpaid' };
    return { state: 'unknown' };
  } catch {
    return { state: 'unknown' };
  }
}

async function main() {
  const token = await pbAuth();
  const headers = { Authorization: token, 'Content-Type': 'application/json' };

  const filter = encodeURIComponent('status="pending_payment"');
  const list = await fetch(
    `${PB_URL}/api/collections/vet_orders/records?filter=${filter}&perPage=200&sort=-id`,
    { headers }
  ).then(r => r.json());

  const items = list.items || [];
  log(`pending_payment orders: ${items.length}`);

  let fixed = 0;
  for (const order of items) {
    // Give the webhook first crack on very fresh orders.
    const created = order.created ? Date.parse(order.created) : 0;
    if (created && Date.now() - created < MIN_AGE_MS) continue;

    const { state, paymentId } = await squarePayment(order.square_order_id);
    if (state !== 'paid') continue;

    const update = { status: 'paid' };
    if (paymentId && !order.square_payment_id) update.square_payment_id = paymentId;
    await fetch(`${PB_URL}/api/collections/vet_orders/records/${order.id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(update),
    });
    fixed++;
    log(`${order.id}: Square PAID -> status=paid${paymentId ? `, payment ${paymentId}` : ''} (webhook missed it)`);
  }
  log(`reconcile done — ${fixed} order(s) recovered`);
}

main().catch(err => {
  log(`FATAL: ${err.message}`);
  process.exit(1);
});
