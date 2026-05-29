#!/usr/bin/env node

const PocketBase = require('pocketbase').default;
const pb = new PocketBase('http://127.0.0.1:8094');

const products = [
  'odu0cz31t369l93', // Bemused
  'ibx5v90s721793q', // Raven
  'h105zsnp29o4tna', // Wolf
  'w159472714y73qa', // Falconer
  'a7newa79x4ebg60', // Wildcat
  '9g917lje6h1lm70', // Roxy
  '874ry6g47tzt1o3', // Incognito
  '99ik0q0w0dhxa4f', // Eye Cage
  '4ps1r7cw565i8g3', // Hex
  'cn4p1r9e380626y', // Creature
  '92jw51b1xm575d1', // Half Hearts
  'a595osvwrc310fr', // Victoriana for Eyeglasses
  'j3v597jm5u2mzoj', // Swirly for Eyeglasses
  '2gh6i3s0w59f107', // Coquette for Eyeglasses
  '714522h3gpz8308', // Snowflake for Eyeglasses
];

async function populateFavorites() {
  try {
    await pb.admins.authWithPassword('admin@banwelldesigns.com', 'changeme123');
    
    const customer = await pb.collection('customers').getFirstListItem('email="info@amasquerade.com"');
    console.log(`✓ Customer: ${customer.business_name} (${customer.id})\n`);

    console.log('Adding products to favorites:');
    let added = 0;

    for (const productId of products) {
      try {
        await pb.collection('favorites').create({
          customer: customer.id,
          product: productId
        });
        console.log(`  ✓ ${productId}`);
        added++;
      } catch (e) {
        console.log(`  ✗ ${productId} - ${e.message}`);
      }
    }

    console.log(`\n✓ Added ${added}/${products.length} products to favorites`);
    console.log(`\nKyra can now see these on her Favorites page and add them to cart!`);

  } catch (error) {
    console.error('Error:', error.message);
  }
}

populateFavorites();
