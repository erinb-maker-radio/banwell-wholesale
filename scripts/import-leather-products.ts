/**
 * Leather Product Import Script for Banwell Wholesale
 *
 * Run: npx tsx scripts/import-leather-products.ts
 *
 * Imports plague doctor masks, fashion masks, and accessories
 * into PocketBase wholesale catalog. Only products currently listed on Etsy.
 * Prices from live Etsy listings (2026-03-30), adjusted from 30% off sale to full retail.
 */

import PocketBase from 'pocketbase';
import * as fs from 'fs';
import * as path from 'path';

const PB_URL = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8094';
const ADMIN_EMAIL = process.env.POCKETBASE_ADMIN_EMAIL || 'admin@banwelldesigns.com';
const ADMIN_PASSWORD = process.env.POCKETBASE_ADMIN_PASSWORD || 'changeme123';

const DATA_DIR = path.resolve(__dirname, '../src/data');

// ============================================================
// PRICES FROM LIVE ETSY LISTINGS (scraped 2026-03-30)
// Full retail = sale_price / 0.70 (Etsy had 30% off sale)
// Only includes products currently listed on Etsy (55 total)
// ============================================================

// 9 plague doctor masks currently on Etsy
const PLAGUE_DOCTOR_SLUGS = [
  'the-furst',       // $300.00 (sale: $210.00) — etsyId: 4464164896
  'the-krankheit',   // $285.00 (sale: $199.50) — etsyId: 4463696536
  'the-maximus',     // $400.00 (sale: $280.00) — etsyId: 4465619702
  'the-schnabel',    // $285.00 (sale: $199.50) — etsyId: 4465623778
  'the-stiltzkin',   // $169.00 (sale: $118.30) — etsyId: 4463698125
  'the-jackdaw',     // $179.00 (sale: $125.30) — etsyId: 4465612579
  'the-bubonis',     // $285.00 (sale: $199.50) — etsyId: 4463679690
  'the-pestis',      // $130.00 (sale: $91.00)  — etsyId: 4463691177
  'the-corax',       // $130.00 (sale: $91.00)  — etsyId: 4463689495
];

const PLAGUE_DOCTOR_PRICES: Record<string, number> = {
  'the-furst':    30000,
  'the-krankheit': 28500,
  'the-maximus':  40000,
  'the-schnabel': 28500,
  'the-stiltzkin': 16900,
  'the-jackdaw':  17900,
  'the-bubonis':  28500,
  'the-pestis':   13000,
  'the-corax':    13000,
};

// 7 plague doctor accessories on Etsy
const ACCESSORY_PRODUCTS = [
  { slug: 'plague-doctor-top-hat',  price: 28500, title: 'Leather Plague Doctor Hat' },
  { slug: 'plague-doctor-hood',     price: 1600,  title: 'Black Balaclava for Plague Doctor Costume' },
  { slug: 'plague-doctor-costume',  price: 38500, title: 'Plague Doctor Costume Accessory Set (Staff, Balaclava, Pouch, Hat)' },
  { slug: 'the-mantle',            price: 28500, title: 'Mantle - Plague Doctor Shoulder Cape' },
  { slug: 'the-galileo-pouch',     price: 9500,  title: 'Galileo Pouch - Leather Plague Doctor Hip Bag' },
  { slug: 'winged-staff-topper',   price: 5900,  title: 'Plague Doctor Staff and Winged Hourglass Topper' },
  { slug: 'plague-doctor-robe',    price: 3800,  title: 'Plague Doctor Robe' },
];

// 39 fashion masks on Etsy
const FASHION_MASK_PRODUCTS = [
  { name: 'Bunny',                       price: 9400  },
  { name: 'Bad Rabbit',                  price: 8400  },
  { name: 'Bemused',                     price: 4200  },
  { name: 'Raven',                       price: 9400  },
  { name: 'Wolf',                        price: 6900  },
  { name: 'Falconer',                    price: 11500 },
  { name: 'Flames',                      price: 4900  },
  { name: 'Wildcat',                     price: 3900  },
  { name: 'Mouse',                       price: 5900  },
  { name: 'Kitty',                       price: 5900  },
  { name: 'Vixen',                       price: 3900  },
  { name: 'Roxy',                        price: 3900  },
  { name: 'Incognito',                   price: 3400  },
  { name: 'Whirly',                      price: 3900  },
  { name: 'Victoriana for Eyeglasses',   price: 5900  },
  { name: 'Totem for Eyeglasses',        price: 5900  },
  { name: 'Swirly for Eyeglasses',       price: 5900  },
  { name: 'Butterfly',                   price: 4900  },
  { name: 'Moon and Stars',              price: 3400  },
  { name: 'Rococo',                      price: 4900  },
  { name: 'Muse',                        price: 4900  },
  { name: 'Coquette',                    price: 4900  },
  { name: 'Bird Beak',                   price: 4200  },
  { name: 'Bird',                        price: 3500  },
  { name: 'Eye Cage',                    price: 6900  },
  { name: 'Coquette for Eyeglasses',     price: 5900  },
  { name: 'Hex',                         price: 4900  },
  { name: 'Victoriana',                  price: 4900  },
  { name: 'Lacy Leaf',                   price: 4900  },
  { name: 'Creature',                    price: 3400  },
  { name: 'Totem',                       price: 5900  },
  { name: 'Hearts',                      price: 4900  },
  { name: 'Lacy Leaf for Eyeglasses',    price: 5900  },
  { name: 'Art Deco Fan',                price: 4900  },
  { name: 'Snowflake for Eyeglasses',    price: 5900  },
  { name: 'Mini Hearts',                 price: 3400  },
  { name: 'Half Hearts',                 price: 4900  },
  { name: 'Snowflake',                   price: 5900  },
  { name: 'Lightning',                   price: 5900  },
];

// ============================================================

function generateSku(prefix: string, index: number): string {
  return `${prefix}-${String(index).padStart(3, '0')}`;
}

async function main() {
  const pb = new PocketBase(PB_URL);
  pb.autoCancellation(false);

  console.log(`Connecting to PocketBase at ${PB_URL}...`);

  try {
    await pb.collection('_superusers').authWithPassword(ADMIN_EMAIL, ADMIN_PASSWORD);
    console.log('Authenticated as admin\n');
  } catch {
    console.error('Failed to authenticate. Make sure PocketBase is running and credentials are correct.');
    process.exit(1);
  }

  // ---- Ensure leather categories exist ----
  const leatherCategories = [
    { name: 'Plague Doctor Masks', slug: 'plague-doctor-masks', default_price: 28500, sort_order: 5, description: 'Handcrafted leather plague doctor masks — 9 characters currently available' },
    { name: 'Fashion Masks', slug: 'fashion-masks', default_price: 4900, sort_order: 6, description: 'Hand-crafted leather masquerade masks — 39 designs' },
    { name: 'Plague Doctor Accessories', slug: 'plague-doctor-accessories', default_price: 9500, sort_order: 7, description: 'Plague doctor costume accessories — hats, hoods, mantles, pouches, staffs' },
  ];

  const categoryMap: Record<string, string> = {};

  console.log('Ensuring leather categories exist...');
  for (const cat of leatherCategories) {
    try {
      const existing = await pb.collection('product_categories').getFirstListItem(`slug="${cat.slug}"`);
      categoryMap[cat.name] = existing.id;
      console.log(`  ${cat.name} already exists (${existing.id})`);
    } catch {
      const record = await pb.collection('product_categories').create(cat);
      categoryMap[cat.name] = record.id;
      console.log(`  Created ${cat.name} (${record.id})`);
    }
  }

  let created = 0;
  let skipped = 0;
  let errors = 0;

  async function importProduct(data: {
    sku: string; title: string; shortTitle: string; category: string;
    price: number; imageUrl: string; description: string; sortOrder: number;
  }) {
    const categoryId = categoryMap[data.category];
    if (!categoryId) {
      console.log(`  WARN: Unknown category "${data.category}" for ${data.sku}, skipping`);
      errors++;
      return;
    }

    try {
      await pb.collection('products').getFirstListItem(`sku="${data.sku}"`);
      skipped++;
      return;
    } catch {
      // Not found, proceed
    }

    // PocketBase image_url field requires a valid URL — skip local /images/ paths
    const imageUrl = data.imageUrl.startsWith('http') ? data.imageUrl : '';

    try {
      await pb.collection('products').create({
        sku: data.sku,
        title: data.title,
        short_title: data.shortTitle,
        category: categoryId,
        retail_price: data.price,
        image_url: imageUrl,
        description: data.description,
        is_active: true,
        sort_order: data.sortOrder,
      });
      created++;
      console.log(`  Imported: ${data.title} ($${(data.price / 100).toFixed(2)})`);
    } catch (err) {
      console.error(`  ERROR importing ${data.sku}: ${err}`);
      errors++;
    }
  }

  // ---- Import Plague Doctor Masks (only 9 currently on Etsy) ----
  console.log('\n--- Importing Plague Doctor Masks (9) ---');
  const allChars = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'plague-doctor-characters.json'), 'utf8'));
  const listedChars = allChars.filter((c: { slug: string }) => PLAGUE_DOCTOR_SLUGS.includes(c.slug));

  for (let i = 0; i < listedChars.length; i++) {
    const char = listedChars[i];
    const price = PLAGUE_DOCTOR_PRICES[char.slug] || 28500;

    await importProduct({
      sku: generateSku('PDM', i + 1),
      title: `${char.name} - Leather Plague Doctor Mask`,
      shortTitle: char.name,
      category: 'Plague Doctor Masks',
      price,
      imageUrl: char.heroImage || '',
      description: char.description,
      sortOrder: i,
    });
  }

  // ---- Import Plague Doctor Accessories (7) ----
  console.log('\n--- Importing Plague Doctor Accessories (7) ---');
  const jsonAccessories = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'plague-doctor-accessories.json'), 'utf8'));

  for (let i = 0; i < ACCESSORY_PRODUCTS.length; i++) {
    const acc = ACCESSORY_PRODUCTS[i];
    const jsonAcc = jsonAccessories.find((a: { slug: string }) => a.slug === acc.slug);

    await importProduct({
      sku: generateSku('PDA', i + 1),
      title: acc.title,
      shortTitle: acc.title.split(' - ')[0],
      category: 'Plague Doctor Accessories',
      price: acc.price,
      imageUrl: jsonAcc?.heroImage || '',
      description: jsonAcc?.description || acc.title,
      sortOrder: i,
    });
  }

  // ---- Import Fashion Masks (39) ----
  console.log('\n--- Importing Fashion Masks (39) ---');

  for (let i = 0; i < FASHION_MASK_PRODUCTS.length; i++) {
    const mask = FASHION_MASK_PRODUCTS[i];
    const isEyeglasses = mask.name.includes('for Eyeglasses');
    const displayTitle = `${mask.name} - Leather ${isEyeglasses ? 'Mask' : 'Masquerade Mask'}`;

    await importProduct({
      sku: generateSku('FM', i + 1),
      title: displayTitle,
      shortTitle: mask.name,
      category: 'Fashion Masks',
      price: mask.price,
      imageUrl: '',
      description: `Hand-crafted leather ${mask.name.toLowerCase()} mask by Tom Banwell`,
      sortOrder: i,
    });
  }

  // ---- Summary ----
  const total = listedChars.length + ACCESSORY_PRODUCTS.length + FASHION_MASK_PRODUCTS.length;
  console.log(`\n${'='.repeat(50)}`);
  console.log('Leather import complete!');
  console.log(`  Created: ${created}`);
  console.log(`  Skipped (already exist): ${skipped}`);
  console.log(`  Errors: ${errors}`);
  console.log(`\nProducts by category:`);
  console.log(`  Plague Doctor Masks: ${listedChars.length}`);
  console.log(`  Plague Doctor Accessories: ${ACCESSORY_PRODUCTS.length}`);
  console.log(`  Fashion Masks: ${FASHION_MASK_PRODUCTS.length}`);
  console.log(`  TOTAL: ${total}`);
}

main().catch(console.error);
