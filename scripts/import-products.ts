/**
 * Product Import Script for Banwell Wholesale
 *
 * Run: npx tsx scripts/import-products.ts
 *
 * Reads ../catalog_data_skus.csv and imports products into PocketBase.
 * Also seeds product_categories and discount_tiers if they're empty.
 */

import PocketBase from 'pocketbase';
import * as fs from 'fs';
import * as path from 'path';

const PB_URL = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8094';
const ADMIN_EMAIL = process.env.POCKETBASE_ADMIN_EMAIL || 'admin@banwelldesigns.com';
const ADMIN_PASSWORD = process.env.POCKETBASE_ADMIN_PASSWORD || 'changeme123';

// Pricing config
const CATEGORY_PRICES: Record<string, number> = {
  'Glass Ornaments': 3500,
  'Paper Cut Ornaments': 1500,
  'Wooden Ornaments': 3500,
  'Glass Sun Catchers': 7200, // default 6-inch
};

const SUN_CATCHER_SIZES: [RegExp, string, number][] = [
  [/15\s*(?:inch|in|")/i, '15 inch', 15300],
  [/12\s*(?:inch|in|")/i, '12 inch', 11900],
  [/10\s*(?:inch|in|")/i, '10 inch', 9800],
  [/6\s*(?:inch|in|")/i, '6 inch', 7200],
];

const CATEGORIES = [
  { name: 'Glass Ornaments', slug: 'glass-ornaments', default_price: 3500, sort_order: 1, description: 'Stained glass-style Christmas ornaments made with real glass' },
  { name: 'Glass Sun Catchers', slug: 'glass-sun-catchers', default_price: 7200, sort_order: 2, description: 'Stained glass-style window hangings in multiple sizes' },
  { name: 'Paper Cut Ornaments', slug: 'paper-cut-ornaments', default_price: 1500, sort_order: 3, description: 'Paper cut style Christmas ornaments' },
  { name: 'Wooden Ornaments', slug: 'wooden-ornaments', default_price: 3500, sort_order: 4, description: 'Laser-cut wooden ornaments' },
];

const DISCOUNT_TIERS = [
  { name: 'Tier 1', min_order_amount: 40000, discount_percent: 40, description: 'Orders $400+ get 40% off retail', is_active: true },
  { name: 'Tier 2', min_order_amount: 80000, discount_percent: 50, description: 'Orders $800+ get 50% off retail', is_active: true },
  { name: 'Tier 3', min_order_amount: 120000, discount_percent: 55, description: 'Orders $1,200+ get 55% off retail', is_active: true },
];

function makeShortTitle(title: string): string {
  return title
    .replace(/:\s*Stained Glass[- ]Style.*$/i, '')
    .replace(/:\s*Stained Glass.*$/i, '')
    .trim();
}

function detectSunCatcherSize(title: string): { size: string | undefined; price: number } {
  for (const [pattern, size, price] of SUN_CATCHER_SIZES) {
    if (pattern.test(title)) return { size, price };
  }
  return { size: undefined, price: 7200 };
}

function parseCsvLine(line: string): string[] {
  const parts: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      parts.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  parts.push(current.trim());
  return parts;
}

async function main() {
  const pb = new PocketBase(PB_URL);
  pb.autoCancellation(false);

  console.log(`Connecting to PocketBase at ${PB_URL}...`);

  try {
    await pb.collection('_superusers').authWithPassword(ADMIN_EMAIL, ADMIN_PASSWORD);
    console.log('Authenticated as admin\n');
  } catch {
    console.error('Failed to authenticate. Run setup-db.ts first.');
    process.exit(1);
  }

  // ---- Seed categories ----
  console.log('Seeding product categories...');
  const categoryMap: Record<string, string> = {}; // name -> id

  for (const cat of CATEGORIES) {
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

  // ---- Seed discount tiers ----
  console.log('\nSeeding discount tiers...');
  const existingTiers = await pb.collection('discount_tiers').getFullList();
  if (existingTiers.length === 0) {
    for (const tier of DISCOUNT_TIERS) {
      await pb.collection('discount_tiers').create(tier);
      console.log(`  Created ${tier.name}`);
    }
  } else {
    console.log(`  ${existingTiers.length} tiers already exist, skipping`);
  }

  // ---- Import products from CSV ----
  const csvPath = path.resolve(__dirname, '../../catalog_data_skus.csv');
  console.log(`\nReading CSV: ${csvPath}`);

  if (!fs.existsSync(csvPath)) {
    console.error('CSV file not found! Expected at:', csvPath);
    process.exit(1);
  }

  const csvContent = fs.readFileSync(csvPath, 'utf8');
  const lines = csvContent.split('\n').filter(l => l.trim());
  const dataLines = lines.slice(1); // skip header

  console.log(`Found ${dataLines.length} products to import\n`);

  let created = 0;
  let skipped = 0;
  let errors = 0;

  for (let i = 0; i < dataLines.length; i++) {
    const parts = parseCsvLine(dataLines[i]);
    if (parts.length < 4) continue;

    const sku = parts[0];
    const section = parts[1];
    // Title may contain commas, so rejoin middle parts
    const imageUrl = parts[parts.length - 1];
    const title = parts.slice(2, parts.length - 1).join(',');

    if (!sku || !section || !title || !imageUrl) continue;

    const categoryId = categoryMap[section];
    if (!categoryId) {
      console.log(`  WARN: Unknown category "${section}" for ${sku}, skipping`);
      errors++;
      continue;
    }

    // Check if already imported
    try {
      await pb.collection('products').getFirstListItem(`sku="${sku}"`);
      skipped++;
      if (skipped % 50 === 0) console.log(`  Skipped ${skipped} existing products...`);
      continue;
    } catch {
      // Not found, proceed with creation
    }

    const shortTitle = makeShortTitle(title);
    let retailPrice = CATEGORY_PRICES[section] || 3500;
    let size: string | undefined;

    if (section === 'Glass Sun Catchers') {
      const detected = detectSunCatcherSize(title);
      retailPrice = detected.price;
      size = detected.size;
    }

    try {
      await pb.collection('products').create({
        sku,
        title,
        short_title: shortTitle,
        category: categoryId,
        retail_price: retailPrice,
        size: size || '',
        image_url: imageUrl,
        is_active: true,
        sort_order: i,
      });
      created++;

      if (created % 25 === 0) {
        console.log(`  Imported ${created} products...`);
      }
    } catch (err) {
      console.error(`  ERROR importing ${sku}: ${err}`);
      errors++;
    }
  }

  console.log(`\nImport complete!`);
  console.log(`  Created: ${created}`);
  console.log(`  Skipped (already exist): ${skipped}`);
  console.log(`  Errors: ${errors}`);
  console.log(`  Total in CSV: ${dataLines.length}`);
}

main().catch(console.error);
