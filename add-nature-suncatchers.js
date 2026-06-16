#!/usr/bin/env node

const PocketBase = require('pocketbase').default;
const fs = require('fs');
const pb = new PocketBase('http://127.0.0.1:8094');

const DESIGNS = [
  {
    name: 'Rabbit',
    imagePath: '/home/erinb/myteam/data/wholesale/inbox/wholesale/20260604-143957.png',
    baseSkuPrefix: 'SUN-207', // Based on ORN-207
    ornamentSku: 'ORN-207'
  },
  {
    name: 'Elk',
    imagePath: '/home/erinb/myteam/data/wholesale/inbox/wholesale/20260604-143958.png',
    baseSkuPrefix: 'SUN-081', // Based on ORN-081 Coastal Elk
    ornamentSku: 'ORN-081'
  },
  {
    name: 'Salamander',
    imagePath: '/home/erinb/myteam/data/wholesale/inbox/wholesale/20260604-144000.png',
    baseSkuPrefix: 'SUN-', // Will need to find next available number
    ornamentSku: 'ORN-' // Will need to find next available number
  },
  {
    name: 'Black Bear',
    imagePath: '/home/erinb/myteam/data/wholesale/inbox/wholesale/20260604-144008.png',
    baseSkuPrefix: 'SUN-', // Will need to find next available number
    ornamentSku: 'ORN-' // Will need to find next available number
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
    console.log('✓ Authenticated as admin\n');

    // Get glass category ID
    const categories = await pb.collection('categories').getFullList();
    const glassCategory = categories.find(c => c.name === 'Glass Suncatchers & Ornaments');
    if (!glassCategory) throw new Error('Glass category not found');

    console.log(`Glass category: ${glassCategory.id}\n`);

    // Find next available SKU numbers for salamander and black bear
    const allProducts = await pb.collection('products').getFullList({ sort: 'sku' });
    const sunSkus = allProducts.filter(p => p.sku.startsWith('SUN-')).map(p => parseInt(p.sku.split('-')[1]));
    const ornSkus = allProducts.filter(p => p.sku.startsWith('ORN-')).map(p => parseInt(p.sku.split('-')[1]));
    const nextSunNum = Math.max(...sunSkus, 0) + 1;
    const nextOrnNum = Math.max(...ornSkus, 0) + 1;

    let salamanderNum = nextSunNum;
    let blackBearNum = nextSunNum + 1;

    // Update SKU prefixes for salamander and black bear
    DESIGNS[2].baseSkuPrefix = `SUN-${String(salamanderNum).padStart(3, '0')}`;
    DESIGNS[2].ornamentSku = `ORN-${String(nextOrnNum).padStart(3, '0')}`;
    DESIGNS[3].baseSkuPrefix = `SUN-${String(blackBearNum).padStart(3, '0')}`;
    DESIGNS[3].ornamentSku = `ORN-${String(nextOrnNum + 1).padStart(3, '0')}`;

    for (const design of DESIGNS) {
      console.log(`\n=== ${design.name.toUpperCase()} ===`);
      
      // Upload image
      const imageBuffer = fs.readFileSync(design.imagePath);
      const formData = new FormData();
      const blob = new Blob([imageBuffer], { type: 'image/png' });
      formData.append('file', blob, `${design.name.toLowerCase()}-suncatcher.png`);
      
      // Create a temporary product to upload the image
      const tempProduct = await pb.collection('products').create({
        sku: `TEMP-${Date.now()}`,
        title: 'temp',
        retail_price: 100,
        category: glassCategory.id,
        is_active: false,
        image: blob
      });

      const imageUrl = pb.getFileUrl(tempProduct, tempProduct.image);
      console.log(`✓ Uploaded image: ${imageUrl.substring(0, 50)}...`);

      // Delete temp product
      await pb.collection('products').delete(tempProduct.id);

      // Update or create ornament (3")
      const ornTitle = `${design.name}: Stained Glass-Style Christmas Ornament - Made With Real Glass`;
      try {
        const existing = await pb.collection('products').getFirstListItem(`sku="${design.ornamentSku}"`);
        await pb.collection('products').update(existing.id, {
          image_url: imageUrl,
          title: ornTitle,
          short_title: design.name
        });
        console.log(`UPDATE: ${design.ornamentSku} ornament with new image`);
      } catch {
        // Create new ornament
        await pb.collection('products').create({
          sku: design.ornamentSku,
          title: ornTitle,
          short_title: design.name,
          size: '3"',
          retail_price: 3500,
          image_url: imageUrl,
          category: glassCategory.id,
          is_active: true
        });
        console.log(`CREATE: ${design.ornamentSku} ornament`);
      }

      // Create suncatcher sizes
      for (const { size, price } of SIZES) {
        const sku = `${design.baseSkuPrefix}-${size.replace('"', '')}`;
        const title = `${design.name}`;
        
        try {
          const existing = await pb.collection('products').getFirstListItem(`sku="${sku}"`);
          console.log(`SKIP: ${sku} already exists`);
        } catch {
          await pb.collection('products').create({
            sku,
            title,
            short_title: title,
            size,
            retail_price: price,
            image_url: imageUrl,
            category: glassCategory.id,
            is_active: true
          });
          console.log(`CREATE: ${sku} ${size} - $${price / 100}`);
        }
      }
    }

    console.log('\n✓ Done!');
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
