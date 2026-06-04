#!/usr/bin/env node

const PocketBase = require('pocketbase').default;
const pb = new PocketBase('http://127.0.0.1:8094');

const CORRECT_PRICES = {
  '6"': 7200,   // $72.00
  '10"': 9800,  // $98.00
  '12"': 11900, // $119.00
  '15"': 15300, // $153.00
};

async function main() {
  try {
    await pb.collection('_superusers').authWithPassword('admin@banwelldesigns.com', 'changeme123');
    console.log('✓ Authenticated as admin\n');

    const products = await pb.collection('products').getFullList({
      filter: 'is_active=true',
      sort: 'sku',
    });

    let updated = 0;
    let skipped = 0;

    for (const product of products) {
      const size = product.size;

      // Skip if no size or size not in our price list
      if (!size || !CORRECT_PRICES[size]) {
        continue;
      }

      const correctPrice = CORRECT_PRICES[size];

      if (product.retail_price === correctPrice) {
        skipped++;
        continue;
      }

      try {
        await pb.collection('products').update(product.id, {
          retail_price: correctPrice,
        });
        console.log(`UPDATE: ${product.sku} (${size}): $${product.retail_price/100} → $${correctPrice/100}`);
        updated++;
      } catch (err) {
        console.error(`ERROR updating ${product.sku}:`, err.message);
      }
    }

    console.log(`\n✓ Done! Updated ${updated}, skipped ${skipped} (already correct)`);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
