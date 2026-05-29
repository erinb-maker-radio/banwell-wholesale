#!/usr/bin/env node

const PocketBase = require('pocketbase').default || require('pocketbase');

const pb = new PocketBase('http://127.0.0.1:8094');

// Suncatcher standard pricing (in cents)
const SUNCATCHER_BASE_PRICE = 7200; // 6" size as the base/default price shown

async function main() {
  try {
    // Authenticate as admin
    await pb.collection('_superusers').authWithPassword(
      'admin@banwelldesigns.com',
      'changeme123'
    );

    console.log('✓ Authenticated as admin');

    // Check if Suncatchers category exists
    let suncatcherCategory;
    try {
      const categories = await pb.collection('product_categories').getFullList();
      suncatcherCategory = categories.find(c => c.slug === 'suncatchers');

      if (!suncatcherCategory) {
        // Create Suncatchers category
        suncatcherCategory = await pb.collection('product_categories').create({
          name: 'Suncatchers',
          slug: 'suncatchers',
          description: 'Stained glass-style window hangings made with real glass. Available in 6", 10", 12", and 15" sizes.',
          default_price: SUNCATCHER_BASE_PRICE,
          sort_order: 2
        });
        console.log('✓ Created Suncatchers category');
      } else {
        console.log('✓ Suncatchers category already exists');
      }
    } catch (err) {
      console.error('Error with category:', err);
      throw err;
    }

    // Get all ornament products
    const ornaments = await pb.collection('products').getFullList({
      filter: 'category.slug = "glass-ornaments" && is_active = true',
      expand: 'category'
    });

    console.log(`✓ Found ${ornaments.length} ornament products`);

    // Check how many suncatchers already exist
    const existingSuncatchers = await pb.collection('products').getFullList({
      filter: 'category = "' + suncatcherCategory.id + '"'
    });

    console.log(`✓ Found ${existingSuncatchers.length} existing suncatcher products`);

    if (existingSuncatchers.length > 0) {
      console.log('Suncatcher products already exist. Skipping creation.');
      console.log('To recreate, delete existing suncatchers first.');
      return;
    }

    // Create suncatcher products based on ornaments
    let created = 0;
    for (const ornament of ornaments) {
      try {
        const suncatcherSKU = ornament.sku.replace('ORN-', 'SUN-');

        // Check if this suncatcher SKU already exists
        const existing = await pb.collection('products').getFirstListItem(
          `sku = "${suncatcherSKU}"`,
          { requestKey: null }
        ).catch(() => null);

        if (existing) {
          console.log(`  Skipping ${suncatcherSKU} - already exists`);
          continue;
        }

        const suncatcherData = {
          title: ornament.title.replace('Christmas Ornament', 'Suncatcher').replace('Ornament', 'Suncatcher'),
          short_title: ornament.short_title,
          sku: suncatcherSKU,
          description: ornament.description || '',
          category: suncatcherCategory.id,
          retail_price: SUNCATCHER_BASE_PRICE, // 6" price as default
          image_url: ornament.image_url.replace('/ornament/', '/suncatcher/').replace('_ornament', '_suncatcher'),
          image: ornament.image || '',
          size: '6"', // Default size
          is_active: true,
          keywords: ornament.keywords || [],
          categories: ornament.categories || [],
          sort_order: ornament.sort_order || 0
        };

        await pb.collection('products').create(suncatcherData);
        created++;

        if (created % 10 === 0) {
          console.log(`  Created ${created} suncatcher products...`);
        }
      } catch (err) {
        console.error(`  Error creating suncatcher for ${ornament.sku}:`, err.message);
      }
    }

    console.log(`\n✓ Created ${created} new suncatcher products`);
    console.log('\nNext steps:');
    console.log('1. Update product detail page to show size selector for suncatchers');
    console.log('2. Update cart to capture size selection');
    console.log('3. Update wholesale catalogs to show size/price table');

  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

main();
