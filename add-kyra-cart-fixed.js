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
  { title: 'Incognito', color: 'BLACK', quantity: 10 },
  { title: 'Eye Cage', quantity: 1 },
  { title: 'Hex', quantity: 1 },
  { title: 'Creature', quantity: 2 },
  { title: 'Half Hearts', quantity: 1 },
  { title: 'Victoriana for Eyeglasses', quantity: 1 },
  { title: 'Swirly for Eyeglasses', quantity: 1 },
  { title: 'Coquette for Eyeglasses', quantity: 1 },
  { title: 'Snowflake for Eyeglasses', quantity: 1 },
];

async function addCartItems() {
  try {
    await pb.admins.authWithPassword('admin@banwelldesigns.com', 'changeme123');
    
    const customer = await pb.collection('customers').getFirstListItem('email="info@amasquerade.com"');
    console.log(`✓ Customer: ${customer.business_name}\n`);

    // Get all mask products
    const allMasks = await pb.collection('products').getList(1, 100, {
      filter: 'short_title~"mask" || title~"mask" || category.name~"mask"'
    });

    console.log('Adding cart items:');
    let added = 0;

    for (const item of order) {
      const product = allMasks.items.find(p => 
        (p.short_title || p.title || '').toLowerCase() === item.title.toLowerCase()
      );

      if (product) {
        try {
          // Create cart item
          await pb.collection('cart_items').create({
            customer: customer.id,
            product: product.id,
            quantity: item.quantity,
            color: item.color || null
          });
          console.log(`  ✓ ${item.title} (qty: ${item.quantity})`);
          added++;
        } catch (e) {
          console.log(`  ✗ ${item.title} - ${e.message}`);
        }
      } else {
        console.log(`  ✗ ${item.title} - NOT FOUND`);
      }
    }

    console.log(`\n✓ Added ${added}/${order.length} items to cart`);
    console.log(`\nKyra can now log in and checkout at:`);
    console.log(`https://wholesale.banwelldesigns.com/account/cart`);

  } catch (error) {
    console.error('Error:', error.message);
  }
}

addCartItems();
