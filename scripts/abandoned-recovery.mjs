// Abandoned-checkout recovery for stainedglassportraits.com orders.
//
// Finds vet_orders stuck in pending_payment 24-72 hours old, VERIFIES the
// payment is really missing against the live Square API (the webhook can drop
// events — never nag someone who already paid), sends ONE plain-text nudge
// email with their original checkout link, and tags the order's notes with
// ABANDON_EMAILED so it can never fire twice.
//
// Run daily via cron:
//   cd /var/www/banwell-wholesale/app && node scripts/abandoned-recovery.mjs
//
// Fail-safe rules:
//   - Square API unreachable or ambiguous  -> skip, try again tomorrow
//   - Square says the order was paid       -> mark PB status=paid, no email
//   - No customer email on record          -> skip permanently (tag notes)
//   - Already tagged ABANDON_EMAILED       -> never touched again

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const nodemailer = require('nodemailer');

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
const GMAIL_USER = 'erin@banwelldesigns.com';

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

// Returns 'paid' | 'unpaid' | 'unknown'. Anything ambiguous is 'unknown' and
// the order is skipped this run — safety over speed.
async function squarePaymentState(squareOrderId) {
  if (!squareOrderId) return 'unknown';
  try {
    const res = await fetch(`${SQUARE_BASE}/v2/orders/${squareOrderId}`, {
      headers: {
        Authorization: `Bearer ${env.SQUARE_ACCESS_TOKEN}`,
        'Square-Version': '2024-06-04',
      },
    });
    if (!res.ok) return 'unknown';
    const data = await res.json();
    const order = data.order;
    if (!order) return 'unknown';
    // A completed tender means money moved regardless of order.state.
    const tenders = order.tenders || [];
    if (tenders.length > 0) return 'paid';
    if (order.state === 'COMPLETED') return 'paid';
    if (order.state === 'OPEN' || order.state === 'DRAFT' || order.state === 'CANCELED') {
      return 'unpaid';
    }
    return 'unknown';
  } catch {
    return 'unknown';
  }
}

function buildEmail(order) {
  const firstName = (order.customer_name || '').trim().split(/\s+/)[0] || '';
  const greeting = firstName ? `Hi ${firstName},` : 'Hi,';
  const subject = 'Your stained glass style portrait is still waiting';
  const body = `${greeting}

I noticed you started ordering a custom ${order.size} stained glass style portrait from us but didn't finish checking out — no worries, it happens.

Your order link is still active if you'd like to pick up where you left off:

${order.square_payment_link}

A quick reminder of how it works: after you order, you send us your favorite photo and we design your portrait and email you a digital proof. Nothing is made until you approve the artwork — and if we can't design something you love, we refund you in full. You're never stuck with a surprise.

If you had a question that stopped you, just reply to this email and I'll answer personally.

Erin Banwell
Banwell Designs — Chico, California
stainedglassportraits.com
`;
  return { subject, body };
}

async function main() {
  const token = await pbAuth();
  const headers = { Authorization: token, 'Content-Type': 'application/json' };

  const now = Date.now();
  const minAge = new Date(now - 72 * 3600 * 1000).toISOString().replace('T', ' ');
  const maxAge = new Date(now - 24 * 3600 * 1000).toISOString().replace('T', ' ');
  const filter = encodeURIComponent(
    `status="pending_payment" && created >= "${minAge}" && created <= "${maxAge}" && notes !~ "ABANDON_EMAILED"`
  );
  const list = await fetch(
    `${PB_URL}/api/collections/vet_orders/records?filter=${filter}&perPage=50`,
    { headers }
  ).then(r => r.json());

  const items = list.items || [];
  log(`candidates in 24-72h window: ${items.length}`);
  if (!items.length) return;

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: { user: GMAIL_USER, pass: env.GMAIL_APP_PASSWORD },
  });

  for (const order of items) {
    const tagNotes = async tag => {
      const notes = `${order.notes ? order.notes + ' | ' : ''}${tag} ${new Date().toISOString().slice(0, 10)}`;
      await fetch(`${PB_URL}/api/collections/vet_orders/records/${order.id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ notes }),
      });
    };

    const state = await squarePaymentState(order.square_order_id);
    if (state === 'paid') {
      log(`${order.id}: Square says PAID — fixing status, no email`);
      await fetch(`${PB_URL}/api/collections/vet_orders/records/${order.id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status: 'paid' }),
      });
      continue;
    }
    if (state === 'unknown') {
      log(`${order.id}: Square state unknown — skipping this run`);
      continue;
    }
    if (!order.customer_email || !order.square_payment_link) {
      log(`${order.id}: missing email or link — tagging so we stop retrying`);
      await tagNotes('ABANDON_EMAILED skipped-no-contact');
      continue;
    }

    const { subject, body } = buildEmail(order);
    try {
      await transporter.sendMail({
        from: `"Erin Banwell" <${GMAIL_USER}>`,
        replyTo: GMAIL_USER,
        to: order.customer_email,
        subject,
        text: body,
      });
      await tagNotes('ABANDON_EMAILED');
      log(`${order.id}: recovery email sent to ${order.customer_email}`);
    } catch (err) {
      log(`${order.id}: SMTP send failed (${err.message}) — will retry tomorrow`);
    }
  }
}

main().catch(err => {
  log(`FATAL: ${err.message}`);
  process.exit(1);
});
