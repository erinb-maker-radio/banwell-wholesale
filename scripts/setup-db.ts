/**
 * PocketBase Schema Setup for Banwell Wholesale
 *
 * Run: npx tsx scripts/setup-db.ts
 *
 * This creates all collections in PocketBase. Run this once after
 * setting up a fresh PocketBase instance.
 *
 * Prerequisites:
 * - PocketBase running on port 8094
 * - Admin account created (admin@banwelldesigns.com)
 */

import PocketBase from 'pocketbase';

const PB_URL = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8094';
const ADMIN_EMAIL = process.env.POCKETBASE_ADMIN_EMAIL || 'admin@banwelldesigns.com';
const ADMIN_PASSWORD = process.env.POCKETBASE_ADMIN_PASSWORD || 'changeme123';

async function main() {
  const pb = new PocketBase(PB_URL);
  pb.autoCancellation(false);

  console.log(`Connecting to PocketBase at ${PB_URL}...`);

  try {
    await pb.collection('_superusers').authWithPassword(ADMIN_EMAIL, ADMIN_PASSWORD);
    console.log('Authenticated as admin');
  } catch (err) {
    console.error('Failed to authenticate. Make sure PocketBase is running and admin account exists.');
    console.error('Create admin at: ' + PB_URL + '/_/');
    process.exit(1);
  }

  // Helper to check if collection exists
  async function collectionExists(name: string): Promise<boolean> {
    try {
      await pb.collections.getOne(name);
      return true;
    } catch {
      return false;
    }
  }

  // Helper to create collection with error details
  async function createCollection(data: Record<string, unknown>) {
    try {
      return await pb.collections.create(data);
    } catch (err: unknown) {
      const e = err as { response?: { data?: unknown } };
      console.error('Collection create failed. Details:', JSON.stringify(e.response?.data, null, 2));
      throw err;
    }
  }

  // ---- product_categories ----
  if (!await collectionExists('product_categories')) {
    console.log('Creating product_categories...');
    await pb.collections.create({
      name: 'product_categories',
      type: 'base',
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'slug', type: 'text', required: true, pattern: '^[a-z0-9-]+$' },
        { name: 'description', type: 'text' },
        { name: 'default_price', type: 'number', min: 0 },
        { name: 'sort_order', type: 'number', min: 0 },
      ],
    });
    console.log('  Created product_categories');
  } else {
    console.log('  product_categories already exists, skipping');
  }

  // ---- products ----
  if (!await collectionExists('products')) {
    console.log('Creating products...');
    const catColl = await pb.collections.getOne('product_categories');
    await createCollection({
      name: 'products',
      type: 'base',
      fields: [
        { name: 'sku', type: 'text', required: true },
        { name: 'title', type: 'text', required: true },
        { name: 'short_title', type: 'text' },
        { name: 'category', type: 'relation', required: true, collectionId: catColl.id, maxSelect: 1 },
        { name: 'retail_price', type: 'number', required: true, min: 0 },
        { name: 'size', type: 'text' },
        { name: 'image', type: 'file', maxSelect: 1, maxSize: 5242880, mimeTypes: ['image/jpeg', 'image/png', 'image/webp'] },
        { name: 'image_url', type: 'url' },
        { name: 'description', type: 'text' },
        { name: 'is_active', type: 'bool' },
        { name: 'sort_order', type: 'number', min: 0 },
      ],
    });
    console.log('  Created products');
  } else {
    console.log('  products already exists, skipping');
  }

  // ---- customers (auth collection) ----
  if (!await collectionExists('customers')) {
    console.log('Creating customers (auth collection)...');
    await pb.collections.create({
      name: 'customers',
      type: 'auth',
      fields: [
        { name: 'business_name', type: 'text', required: true },
        { name: 'contact_name', type: 'text', required: true },
        { name: 'phone', type: 'text' },
        { name: 'address', type: 'text' },
        { name: 'city', type: 'text' },
        { name: 'state', type: 'text' },
        { name: 'zip', type: 'text' },
        { name: 'website', type: 'url' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'select', values: ['active', 'inactive', 'pending'], maxSelect: 1 },
        { name: 'discount_tier', type: 'select', values: ['auto', 'tier1', 'tier2', 'tier3'], maxSelect: 1 },
        { name: 'square_customer_id', type: 'text' },
      ],
      options: {
        allowEmailAuth: true,
        allowUsernameAuth: false,
        requireEmail: true,
        minPasswordLength: 8,
      },
    });
    console.log('  Created customers');
  } else {
    console.log('  customers already exists, skipping');
  }

  // ---- contacts ----
  if (!await collectionExists('contacts')) {
    console.log('Creating contacts...');
    const customersColl = await pb.collections.getOne('customers');
    await pb.collections.create({
      name: 'contacts',
      type: 'base',
      fields: [
        { name: 'customer', type: 'relation', required: true, collectionId: customersColl.id, maxSelect: 1, cascadeDelete: true },
        { name: 'name', type: 'text', required: true },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'text' },
        { name: 'role', type: 'text' },
        { name: 'is_primary', type: 'bool' },
        { name: 'notes', type: 'text' },
      ],
    });
    console.log('  Created contacts');
  } else {
    console.log('  contacts already exists, skipping');
  }

  // ---- discount_tiers ----
  if (!await collectionExists('discount_tiers')) {
    console.log('Creating discount_tiers...');
    await pb.collections.create({
      name: 'discount_tiers',
      type: 'base',
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'min_order_amount', type: 'number', required: true, min: 0 },
        { name: 'discount_percent', type: 'number', required: true, min: 0, max: 100 },
        { name: 'description', type: 'text' },
        { name: 'is_active', type: 'bool' },
      ],
    });
    console.log('  Created discount_tiers');
  } else {
    console.log('  discount_tiers already exists, skipping');
  }

  // ---- orders ----
  if (!await collectionExists('orders')) {
    console.log('Creating orders...');
    const customersColl = await pb.collections.getOne('customers');
    await pb.collections.create({
      name: 'orders',
      type: 'base',
      fields: [
        { name: 'order_number', type: 'text', required: true },
        { name: 'customer', type: 'relation', required: true, collectionId: customersColl.id, maxSelect: 1, cascadeDelete: false },
        { name: 'status', type: 'select', required: true, values: ['pending_payment', 'payment_received', 'being_fulfilled', 'shipped', 'delivered', 'follow_up'], maxSelect: 1 },
        { name: 'payment_method', type: 'select', values: ['square', 'invoice'], maxSelect: 1 },
        { name: 'subtotal', type: 'number', min: 0 },
        { name: 'discount_percent', type: 'number', min: 0, max: 100 },
        { name: 'discount_amount', type: 'number', min: 0 },
        { name: 'total', type: 'number', min: 0 },
        { name: 'square_payment_id', type: 'text' },
        { name: 'square_checkout_id', type: 'text' },
        { name: 'invoice_terms', type: 'text' },
        { name: 'shipping_address', type: 'text' },
        { name: 'tracking_number', type: 'text' },
        { name: 'shipped_date', type: 'date' },
        { name: 'delivered_date', type: 'date' },
        { name: 'follow_up_date', type: 'date' },
        { name: 'follow_up_sent', type: 'bool' },
        { name: 'notes', type: 'text' },
      ],
    });
    console.log('  Created orders');
  } else {
    console.log('  orders already exists, skipping');
  }

  // ---- order_items ----
  if (!await collectionExists('order_items')) {
    console.log('Creating order_items...');
    const ordersColl = await pb.collections.getOne('orders');
    const productsColl = await pb.collections.getOne('products');
    await pb.collections.create({
      name: 'order_items',
      type: 'base',
      fields: [
        { name: 'order', type: 'relation', required: true, collectionId: ordersColl.id, maxSelect: 1, cascadeDelete: true },
        { name: 'product', type: 'relation', required: true, collectionId: productsColl.id, maxSelect: 1, cascadeDelete: false },
        { name: 'quantity', type: 'number', required: true, min: 1 },
        { name: 'unit_price', type: 'number', required: true, min: 0 },
        { name: 'line_total', type: 'number', required: true, min: 0 },
      ],
    });
    console.log('  Created order_items');
  } else {
    console.log('  order_items already exists, skipping');
  }

  // ---- curated_products ----
  if (!await collectionExists('curated_products')) {
    console.log('Creating curated_products...');
    const customersColl = await pb.collections.getOne('customers');
    const productsColl = await pb.collections.getOne('products');
    await pb.collections.create({
      name: 'curated_products',
      type: 'base',
      fields: [
        { name: 'customer', type: 'relation', required: true, collectionId: customersColl.id, maxSelect: 1, cascadeDelete: true },
        { name: 'product', type: 'relation', required: true, collectionId: productsColl.id, maxSelect: 1, cascadeDelete: true },
        { name: 'sort_order', type: 'number', min: 0 },
      ],
    });
    console.log('  Created curated_products');
  } else {
    console.log('  curated_products already exists, skipping');
  }

  // ---- favorites ----
  if (!await collectionExists('favorites')) {
    console.log('Creating favorites...');
    const customersColl = await pb.collections.getOne('customers');
    const productsColl = await pb.collections.getOne('products');
    await pb.collections.create({
      name: 'favorites',
      type: 'base',
      fields: [
        { name: 'customer', type: 'relation', required: true, collectionId: customersColl.id, maxSelect: 1, cascadeDelete: true },
        { name: 'product', type: 'relation', required: true, collectionId: productsColl.id, maxSelect: 1, cascadeDelete: true },
      ],
    });
    console.log('  Created favorites');
  } else {
    console.log('  favorites already exists, skipping');
  }

  // ---- invoices ----
  if (!await collectionExists('invoices')) {
    console.log('Creating invoices...');
    const ordersColl = await pb.collections.getOne('orders');
    const customersColl = await pb.collections.getOne('customers');
    await pb.collections.create({
      name: 'invoices',
      type: 'base',
      fields: [
        { name: 'order', type: 'relation', required: true, collectionId: ordersColl.id, maxSelect: 1, cascadeDelete: false },
        { name: 'customer', type: 'relation', required: true, collectionId: customersColl.id, maxSelect: 1, cascadeDelete: false },
        { name: 'invoice_number', type: 'text', required: true },
        { name: 'amount', type: 'number', min: 0 },
        { name: 'due_date', type: 'date' },
        { name: 'status', type: 'select', values: ['draft', 'sent', 'paid', 'overdue', 'cancelled'], maxSelect: 1 },
        { name: 'square_invoice_id', type: 'text' },
        { name: 'square_payment_id', type: 'text' },
        { name: 'paid_date', type: 'date' },
        { name: 'paid_amount', type: 'number' },
        { name: 'sent_date', type: 'date' },
        { name: 'notes', type: 'text' },
      ],
    });
    console.log('  Created invoices');
  } else {
    console.log('  invoices already exists, skipping');
  }

  // ---- communications ----
  if (!await collectionExists('communications')) {
    console.log('Creating communications...');
    const customersColl = await pb.collections.getOne('customers');
    await pb.collections.create({
      name: 'communications',
      type: 'base',
      fields: [
        { name: 'customer', type: 'relation', required: true, collectionId: customersColl.id, maxSelect: 1, cascadeDelete: true },
        { name: 'type', type: 'select', values: ['call', 'email', 'meeting', 'note', 'order_placed', 'payment_received', 'shipped', 'follow_up'], maxSelect: 1 },
        { name: 'subject', type: 'text' },
        { name: 'content', type: 'text' },
        { name: 'date', type: 'date' },
        { name: 'logged_by', type: 'text' },
      ],
    });
    console.log('  Created communications');
  } else {
    console.log('  communications already exists, skipping');
  }

  console.log('\nSchema setup complete!');
  console.log('Next steps:');
  console.log('  1. Run: npm run import-products');
  console.log('  2. Run: npm run dev');
}

main().catch(console.error);
