#!/usr/bin/env node
/**
 * Update PocketBase products with categorization data
 */

import * as fs from 'fs';
import * as path from 'path';
import PocketBase from 'pocketbase';

const CATEGORIZED_DATA_PATH = path.join(__dirname, '../data/categorized-products.json');
const POCKETBASE_URL = 'http://127.0.0.1:8094';
const ADMIN_EMAIL = process.env.POCKETBASE_ADMIN_EMAIL || 'admin@banwelldesigns.com';
const ADMIN_PASSWORD = process.env.POCKETBASE_ADMIN_PASSWORD || 'changeme123';

interface CategorizedProduct {
  sku: string;
  section: string;
  title: string;
  imageUrl: string;
  categories: string[];
  keywords: string[];
  searchable_text: string;
}

// Initialize PocketBase
const pb = new PocketBase(POCKETBASE_URL);

// Read categorized products
console.log('Reading categorized products...');
const categorized: CategorizedProduct[] = JSON.parse(
  fs.readFileSync(CATEGORIZED_DATA_PATH, 'utf-8')
);
console.log(`Found ${categorized.length} categorized products`);
console.log();

// Update products in batches
console.log('Updating PocketBase products...');
console.log('='.repeat(80));

let updated = 0;
let created = 0;
let errors = 0;
let skipped = 0;

async function updateProduct(product: CategorizedProduct) {
  try {
    // Try to find existing product by SKU
    const searchResults = await pb.collection('products').getList(1, 1, {
      filter: `sku='${product.sku}'`
    });

    const updateData = {
      sku: product.sku,
      section: product.section,
      title: product.title,
      image_url: product.imageUrl,
      categories: product.categories,
      keywords: product.keywords,
      searchable_text: product.searchable_text,
      retail_price: getRetailPrice(product.section, product.title)
    };

    if (searchResults.items.length > 0) {
      // Update existing product
      const existingId = searchResults.items[0].id;
      await pb.collection('products').update(existingId, updateData);
      updated++;
    } else {
      // Create new product
      await pb.collection('products').create(updateData);
      created++;
    }

    return true;
  } catch (error) {
    console.error(`Error processing ${product.sku}:`, error);
    errors++;
    return false;
  }
}

// Get retail price based on section and title
function getRetailPrice(section: string, title: string): number {
  if (section === 'Glass Ornaments') {
    return 3500; // $35
  }

  if (section === 'Glass Sun Catchers') {
    // Detect size from title
    if (/15\s*(?:inch|in|")/i.test(title)) return 15300; // $153
    if (/12\s*(?:inch|in|")/i.test(title)) return 11900; // $119
    if (/10\s*(?:inch|in|")/i.test(title)) return 9800; // $98
    if (/6\s*(?:inch|in|")/i.test(title)) return 7200; // $72
    return 7200; // Default to 6"
  }

  if (section === 'Paper Cut Ornaments') {
    return 1500; // $15
  }

  return 3500; // Default
}

// Process all products
async function processAll() {
  // Authenticate as admin
  console.log('Authenticating with PocketBase...');
  try {
    await pb.collection('_superusers').authWithPassword(ADMIN_EMAIL, ADMIN_PASSWORD);
    console.log('✅ Authenticated successfully');
  } catch (error) {
    console.error('❌ Authentication failed:', error);
    console.error('Make sure PocketBase is running and admin credentials are correct.');
    process.exit(1);
  }

  console.log('Starting batch update...');
  console.log();

  for (let i = 0; i < categorized.length; i++) {
    const product = categorized[i];

    await updateProduct(product);

    // Progress indicator every 50 products
    if ((i + 1) % 50 === 0) {
      console.log(`Progress: ${i + 1}/${categorized.length} products processed...`);
    }

    // Small delay to avoid overwhelming the API
    await new Promise(resolve => setTimeout(resolve, 10));
  }

  console.log();
  console.log('='.repeat(80));
  console.log('UPDATE COMPLETE');
  console.log('='.repeat(80));
  console.log(`✅ Updated: ${updated} products`);
  console.log(`✅ Created: ${created} products`);
  console.log(`⚠️  Errors: ${errors} products`);
  console.log(`⚠️  Skipped: ${skipped} products`);
  console.log('='.repeat(80));
}

// Run the update
processAll().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
