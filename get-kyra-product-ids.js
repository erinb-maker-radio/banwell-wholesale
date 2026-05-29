#!/usr/bin/env node

const PocketBase = require('pocketbase').default;
const pb = new PocketBase('http://127.0.0.1:8094');

const order = [
  { title: 'Bemused', quantity: 1 },
  { title: 'Raven', quantity: 1 },
  { title: 'Wolf', quantity: 1 },
  { title: 'Falconer', quantity: 1 },
  { title: 'Wildcat', quantity: 1 },
  { title: 'Roxy', quantity: 1 },
  { title: 'Incognito', quantity: 10 },
  { title: 'Eye Cage', quantity: 1 },
  { title: 'Hex', quantity: 1 },
  { title: 'Creature', quantity: 2 },
  { title: 'Half Hearts', quantity: 1 },
  { title: 'Victoriana for Eyeglasses', quantity: 1 },
  { title: 'Swirly for Eyeglasses', quantity: 1 },
  { title: 'Coquette for Eyeglasses', quantity: 1 },
  { title: 'Snowflake for Eyeglasses', quantity: 1 },
];

async function getProductIds() {
  try {
    await pb.admins.authWithPassword('admin@banwelldesigns.com', 'changeme123');
    
    const allMasks = await pb.collection('products').getList(1, 100, {
      filter: 'short_title~"mask" || title~"mask"'
    });

    const cartItems = [];
    
    for (const item of order) {
      const product = allMasks.items.find(p => 
        (p.short_title || '').toLowerCase() === item.title.toLowerCase()
      );

      if (product) {
        cartItems.push({
          productId: product.id,
          quantity: item.quantity
        });
        console.log(`✓ ${item.title} -> ${product.id}`);
      } else {
        console.log(`✗ ${item.title} - NOT FOUND`);
      }
    }

    console.log(`\n--- Cart Data (${cartItems.length} items) ---`);
    const cartJson = JSON.stringify(cartItems);
    const cartBase64 = Buffer.from(cartJson).toString('base64');
    
    console.log('\nBase64 encoded:');
    console.log(cartBase64);
    
    console.log('\n--- Shareable URL ---');
    console.log(`https://wholesale.banwelldesigns.com/account/cart?load=${cartBase64}`);

  } catch (error) {
    console.error('Error:', error.message);
  }
}

getProductIds();
