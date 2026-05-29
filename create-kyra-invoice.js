#!/usr/bin/env node

const PocketBase = require('pocketbase').default;
const pb = new PocketBase('http://127.0.0.1:8094');

const order = [
  { title: 'Bemused', retail: 42, quantity: 1 },
  { title: 'Raven', retail: 94, quantity: 1 },
  { title: 'Wolf', retail: 69, quantity: 1 },
  { title: 'Falconer', retail: 115, quantity: 1 },
  { title: 'Wildcat', retail: 39, quantity: 1 },
  { title: 'Roxy', retail: 39, quantity: 1 },
  { title: 'Incognito', retail: 34, quantity: 10 },
  { title: 'Eye Cage', retail: 69, quantity: 1 },
  { title: 'Hex', retail: 49, quantity: 1 },
  { title: 'Creature', retail: 34, quantity: 2 },
  { title: 'Half Hearts', retail: 49, quantity: 1 },
  { title: 'Victoriana for Eyeglasses', retail: 59, quantity: 1 },
  { title: 'Swirly for Eyeglasses', retail: 59, quantity: 1 },
  { title: 'Coquette for Eyeglasses', retail: 59, quantity: 1 },
  { title: 'Snowflake for Eyeglasses', retail: 59, quantity: 1 },
];

async function createInvoice() {
  try {
    await pb.admins.authWithPassword('admin@banwelldesigns.com', 'changeme123');
    
    const customer = await pb.collection('customers').getFirstListItem('email="info@amasquerade.com"');
    console.log(`✓ Customer: ${customer.business_name}\n`);

    // Get all mask products
    const allMasks = await pb.collection('products').getList(1, 100, {
      filter: 'short_title~"mask" || title~"mask"'
    });

    // Match products and create order items
    const orderItems = [];
    console.log('Matching products:');
    
    for (const item of order) {
      const product = allMasks.items.find(p => 
        (p.short_title || '').toLowerCase().includes(item.title.toLowerCase())
      );

      if (product) {
        orderItems.push({
          product_id: product.id,
          sku: product.sku,
          title: product.short_title || product.title,
          quantity: item.quantity,
          unit_price: product.retail_price || item.retail,
          total: (product.retail_price || item.retail) * item.quantity
        });
        console.log(`  ✓ ${item.title} -> ${product.short_title}`);
      } else {
        console.log(`  ✗ ${item.title} - NOT FOUND`);
      }
    }

    const subtotal = orderItems.reduce((sum, i) => sum + i.total, 0);
    const discount = 0.55; // 55% off (tier 3)
    const total = subtotal * (1 - discount);

    console.log(`\nOrder Summary:`);
    console.log(`  Subtotal: $${subtotal.toFixed(2)}`);
    console.log(`  Discount: ${discount * 100}% off`);
    console.log(`  Total: $${total.toFixed(2)}`);

    // Create invoice
    const invoice = await pb.collection('invoices').create({
      customer: customer.id,
      order_items: JSON.stringify(orderItems),
      subtotal: subtotal,
      discount_percent: discount * 100,
      total: total,
      status: 'pending',
      notes: 'Opening order - first wholesale buyer!'
    });

    console.log(`\n✓ Invoice created: ${invoice.id}`);
    console.log(`\nKyra can view and pay at:`);
    console.log(`https://wholesale.banwelldesigns.com/account/invoices/${invoice.id}`);

  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Details:', JSON.stringify(error.response, null, 2));
    }
  }
}

createInvoice();
