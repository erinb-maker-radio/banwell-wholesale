#!/usr/bin/env node

const PocketBase = require('pocketbase').default;
const pb = new PocketBase('http://127.0.0.1:8094');

async function checkProducts() {
  try {
    await pb.admins.authWithPassword('admin@banwelldesigns.com', 'changeme123');
    console.log('✓ Authenticated as admin\n');

    // Get products without sort
    const products = await pb.collection('products').getList(1, 50);
    console.log(`✓ Found ${products.totalItems} total products\n`);

    // Show first 10 product names
    console.log('First 10 products:');
    products.items.slice(0, 10).forEach(p => {
      console.log(`  - ${p.short_title || p.title || p.name} (${p.id})`);
    });

    // Search for fashion masks specifically
    console.log('\nSearching for fashion/mask products:');
    const masks = await pb.collection('products').getList(1, 50, {
      filter: 'short_title~"mask" || title~"mask" || category.name~"mask"'
    });
    
    console.log(`Found ${masks.totalItems} mask-related products:`);
    masks.items.forEach(p => {
      console.log(`  - ${p.short_title || p.title || p.name} (retail: $${p.price/100})`);
    });

  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response:', JSON.stringify(error.response, null, 2));
    }
  }
}

checkProducts();
