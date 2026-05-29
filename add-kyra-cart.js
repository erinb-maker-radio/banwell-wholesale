#!/usr/bin/env node

const PocketBase = require('pocketbase').default;
const pb = new PocketBase('http://127.0.0.1:8094');

// Kyra's order from the email
const order = [
  { title: 'Bemused', retail: 42, quantity: 1 },
  { title: 'Raven', retail: 94, quantity: 1 },
  { title: 'Wolf', retail: 69, quantity: 1 },
  { title: 'Falconer', retail: 115, quantity: 1 },
  { title: 'Wildcat', retail: 39, quantity: 1 },
  { title: 'Roxy', retail: 39, quantity: 1 },
  { title: 'Incognito,BLACK', retail: 34, quantity: 10 },
  { title: 'Eye Cage', retail: 69, quantity: 1 },
  { title: 'Hex', retail: 49, quantity: 1 },
  { title: 'Creature', retail: 34, quantity: 2 },
  { title: 'Half Hearts', retail: 49, quantity: 1 },
  { title: 'Victoriana, Eyeglasses', retail: 59, quantity: 1 },
  { title: 'Swirly, Eyeglasses', retail: 59, quantity: 1 },
  { title: 'Coquette, Eyeglasses', retail: 59, quantity: 1 },
  { title: 'Snowflake,Eyeglasses', retail: 59, quantity: 1 },
];

async function addCartItems() {
  try {
    await pb.admins.authWithPassword('admin@banwelldesigns.com', 'changeme123');
    console.log('✓ Authenticated as admin');

    // Get Kyra's customer record
    const customer = await pb.collection('customers').getFirstListItem('email="info@amasquerade.com"');
    console.log(`✓ Found customer: ${customer.business_name} (ID: ${customer.id})`);

    // Get all products to map names to IDs
    const products = await pb.collection('products').getFullList({ sort: '-created' });
    console.log(`✓ Loaded ${products.length} products`);

    console.log('\nAdding cart items:');
    let itemsAdded = 0;

    for (const item of order) {
      // Try to find matching product
      const product = products.find(p => {
        const title = p.title || p.short_title || p.name || '';
        return title.toLowerCase().includes(item.title.toLowerCase().replace(/,/g, '').trim());
      });

      if (product) {
        console.log(`  ✓ ${item.title} (qty: ${item.quantity}) -> ${product.short_title || product.title}`);
        itemsAdded++;
      } else {
        console.log(`  ✗ ${item.title} - NOT FOUND in products database`);
      }
    }

    console.log(`\n✓ Summary: ${itemsAdded}/${order.length} items ready`);
    console.log(`\nNote: Cart items need to be added through the wholesale shop interface.`);
    console.log(`Kyra can log in and add these items to her cart manually,`);
    console.log(`or you can share the product links with her.`);

  } catch (error) {
    console.error('Error:', error);
    if (error.response) {
      console.error('Response:', error.response);
    }
  }
}

addCartItems();
