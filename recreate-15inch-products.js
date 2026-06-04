#!/usr/bin/env node

const PocketBase = require('pocketbase').default;
const pb = new PocketBase('http://127.0.0.1:8094');

async function main() {
  try {
    // Auth as admin (PocketBase uses _superusers collection)
    await pb.collection('_superusers').authWithPassword('admin@banwelldesigns.com', 'changeme123');
    console.log('✓ Authenticated as admin\n');

    // Get all 12" products
    const products12 = await pb.collection('products').getFullList({
      filter: 'size="12\\"" && is_active=true',
      sort: 'sku',
    });

    console.log(`Found ${products12.length} products at 12" size\n`);

    let created = 0;
    let skipped = 0;

    for (const p12 of products12) {
      // Generate 15" SKU
      let sku15 = p12.sku.replace(/-12$/, '-15');
      if (sku15 === p12.sku && p12.sku.match(/-\d{3}$/)) {
        // Pattern like SUN-001, make SUN-001-15
        sku15 = p12.sku + '-15';
      }

      // Check if already exists
      try {
        const existing = await pb.collection('products').getFirstListItem(`sku="${sku15}"`);
        console.log(`SKIP: ${sku15} already exists`);
        skipped++;
        continue;
      } catch (e) {
        // Doesn't exist, continue to create
      }

      // Update titles
      const title15 = p12.title.replace(/12[""]/, '15"').replace(/12 inch/gi, '15 inch');
      const shortTitle15 = p12.short_title
        ? p12.short_title.replace(/12[""]/, '15"').replace(/12 inch/gi, '15 inch')
        : title15;

      const newProduct = {
        sku: sku15,
        title: title15,
        short_title: shortTitle15,
        size: '15"',
        retail_price: 7500, // $75.00
        image_url: p12.image_url || '',
        image: p12.image || '',
        category: p12.category,
        description: p12.description || '',
        is_active: true,
      };

      try {
        await pb.collection('products').create(newProduct);
        console.log(`CREATE: ${sku15} - ${shortTitle15} ($75.00)`);
        created++;
      } catch (err) {
        console.error(`ERROR creating ${sku15}:`, err.message);
        if (err.response) {
          const data = await err.response.json();
          console.error('  Details:', JSON.stringify(data));
        }
      }
    }

    console.log(`\n✓ Done! Created ${created}, skipped ${skipped}`);
  } catch (error) {
    console.error('Error:', error);
    if (error.response) {
      const data = await error.response.json();
      console.error('Response:', data);
    }
    process.exit(1);
  }
}

main();
