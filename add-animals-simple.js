#!/usr/bin/env node

const PocketBase = require('pocketbase').default;
const pb = new PocketBase('http://127.0.0.1:8094');

const GLASS_CATEGORY = '94b2o8bejgv87z4';

// For now, using placeholder image URLs - will update with actual uploaded images
const DESIGNS = [
  {
    name: 'Rabbit',
    imagePath: '/home/erinb/myteam/data/wholesale/inbox/wholesale/20260604-143957.png',
    ornamentSku: 'ORN-207',
    sunSkuPrefix: 'SUN-207'
  },
  {
    name: 'Coastal Elk',
    imagePath: '/home/erinb/myteam/data/wholesale/inbox/wholesale/20260604-143958.png',
    ornamentSku: 'ORN-081',
    sunSkuPrefix: 'SUN-081'
  },
  {
    name: 'Salamander',
    imagePath: '/home/erinb/myteam/data/wholesale/inbox/wholesale/20260604-144000.png',
    ornamentSku: 'ORN-338', // Next available
    sunSkuPrefix: 'SUN-338'
  },
  {
    name: 'Black Bear',
    imagePath: '/home/erinb/myteam/data/wholesale/inbox/wholesale/20260604-144008.png',
    ornamentSku: 'ORN-339',
    sunSkuPrefix: 'SUN-339'
  }
];

const SIZES = [
  { size: '6"', price: 7200 },
  { size: '10"', price: 9800 },
  { size: '12"', price: 11900 },
  { size: '15"', price: 15300 }
];

async function main() {
  try {
    await pb.collection('_superusers').authWithPassword('admin@banwelldesigns.com', 'changeme123');
    console.log('✓ Authenticated\n');

    for (const design of DESIGNS) {
      console.log(`\n=== ${design.name.toUpperCase()} ===`);

      // Use a placeholder image URL for now
      const imageUrl = 'https://i.etsystatic.com/5128790/r/il/be0ec9/6348876632/il_794xN.6348876632_h9cl.jpg';

      // Check if ornament exists, create if not
      try {
        const existing = await pb.collection('products').getFirstListItem(`sku="${design.ornamentSku}"`);
        console.log(`EXISTS: ${design.ornamentSku} ornament`);
      } catch {
        const ornTitle = `${design.name}: Stained Glass-Style Christmas Ornament - Made With Real Glass`;
        await pb.collection('products').create({
          sku: design.ornamentSku,
          title: ornTitle,
          short_title: design.name,
          size: '3"',
          retail_price: 3500,
          image_url: imageUrl,
          category: GLASS_CATEGORY,
          is_active: true
        });
        console.log(`CREATE: ${design.ornamentSku} ornament ($35)`);
      }

      // Create suncatcher sizes
      for (const { size, price } of SIZES) {
        const sku = `${design.sunSkuPrefix}-${size.replace('"', '')}`;

        try {
          const existing = await pb.collection('products').getFirstListItem(`sku="${sku}"`);
          console.log(`EXISTS: ${sku}`);
        } catch {
          await pb.collection('products').create({
            sku,
            title: design.name,
            short_title: design.name,
            size,
            retail_price: price,
            image_url: imageUrl,
            category: GLASS_CATEGORY,
            is_active: true
          });
          console.log(`CREATE: ${sku} ${size} - $${price / 100}`);
        }
      }
    }

    console.log('\n✓ Done! Products created with placeholder images.');
    console.log('Next step: Upload actual images to update image_url fields.');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();
