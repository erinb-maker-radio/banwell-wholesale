#!/usr/bin/env node
/**
 * Categorize all products in the database
 * Reads from catalog CSV, applies taxonomy, updates PocketBase
 */

import { categorizeProduct, getCategoryLabel } from '../src/lib/product-taxonomy';
import * as fs from 'fs';
import * as path from 'path';

const CATALOG_CSV_PATH = '/home/erinb/projects/Banwell Designs Projects/Glass Catalog 2.0/catalog_data_skus.csv';
const POCKETBASE_URL = 'http://127.0.0.1:8094';

interface Product {
  sku: string;
  section: string;
  title: string;
  imageUrl: string;
}

// Read catalog CSV
console.log('Reading catalog CSV...');
const csvContent = fs.readFileSync(CATALOG_CSV_PATH, 'utf-8');
const lines = csvContent.trim().split('\n');
const products: Product[] = lines.slice(1).map(line => {
  const [sku, section, ...rest] = line.split(',');
  const title = rest.slice(0, -1).join(',');
  const imageUrl = rest[rest.length - 1];
  return { sku, section, title, imageUrl };
});

console.log(`Found ${products.length} products in catalog`);
console.log();

// Categorize all products
console.log('Categorizing products...');
const categorized = products.map(product => {
  const categories = categorizeProduct(product.title);
  const keywords = extractKeywords(product.title);
  const searchableText = buildSearchableText(product.title, categories, keywords);

  return {
    ...product,
    categories,
    keywords,
    searchable_text: searchableText
  };
});

// Extract keywords from title
function extractKeywords(title: string): string[] {
  const cleaned = title
    .toLowerCase()
    .replace(/stained glass style/gi, '')
    .replace(/window hanging/gi, '')
    .replace(/christmas ornament/gi, '')
    .replace(/made with real glass/gi, '')
    .replace(/paper cut/gi, '')
    .replace(/ornament/gi, '')
    .replace(/:/g, '')
    .replace(/-/g, ' ')
    .trim();

  const words = cleaned
    .split(/\s+/)
    .filter(word => word.length > 2)
    .filter(word => !['the', 'and', 'with', 'for'].includes(word));

  return [...new Set(words)]; // unique
}

// Build searchable text field
function buildSearchableText(title: string, categories: string[], keywords: string[]): string {
  const categoryLabels = categories.map(c => getCategoryLabel(c));
  return [
    title,
    ...categoryLabels,
    ...keywords
  ].join(' ').toLowerCase();
}

// Generate statistics
console.log('='.repeat(80));
console.log('CATEGORIZATION RESULTS');
console.log('='.repeat(80));
console.log();

const stats = {
  totalProducts: categorized.length,
  categorized: categorized.filter(p => p.categories.length > 0).length,
  uncategorized: categorized.filter(p => p.categories.length === 0).length,
  avgCategories: categorized.reduce((sum, p) => sum + p.categories.length, 0) / categorized.length,
  categoryCounts: {} as Record<string, number>
};

// Count by top-level category
categorized.forEach(p => {
  p.categories.forEach(cat => {
    const topLevel = cat.split('.')[0];
    stats.categoryCounts[topLevel] = (stats.categoryCounts[topLevel] || 0) + 1;
  });
});

console.log(`Total products: ${stats.totalProducts}`);
console.log(`Categorized: ${stats.categorized} (${((stats.categorized / stats.totalProducts) * 100).toFixed(1)}%)`);
console.log(`Uncategorized: ${stats.uncategorized}`);
console.log(`Average categories per product: ${stats.avgCategories.toFixed(1)}`);
console.log();

console.log('Products per top-level category:');
Object.entries(stats.categoryCounts)
  .sort((a, b) => b[1] - a[1])
  .forEach(([cat, count]) => {
    console.log(`  ${cat}: ${count} products`);
  });

// Show uncategorized products if any
if (stats.uncategorized > 0) {
  console.log();
  console.log(`⚠️  ${stats.uncategorized} uncategorized products:`);
  categorized
    .filter(p => p.categories.length === 0)
    .slice(0, 20)
    .forEach(p => {
      console.log(`  - ${p.sku}: ${p.title}`);
    });
  if (stats.uncategorized > 20) {
    console.log(`  ... and ${stats.uncategorized - 20} more`);
  }
}

// Write results to JSON file
const outputPath = path.join(__dirname, '../data/categorized-products.json');
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, JSON.stringify(categorized, null, 2));
console.log();
console.log(`✅ Results written to: ${outputPath}`);

// Show category breakdown by section
console.log();
console.log('='.repeat(80));
console.log('CATEGORY BREAKDOWN BY PRODUCT SECTION');
console.log('='.repeat(80));
console.log();

const sections = [...new Set(categorized.map(p => p.section))];
sections.forEach(section => {
  const sectionProducts = categorized.filter(p => p.section === section);
  const sectionCategories: Record<string, number> = {};

  sectionProducts.forEach(p => {
    p.categories.forEach(cat => {
      sectionCategories[cat] = (sectionCategories[cat] || 0) + 1;
    });
  });

  console.log(`${section} (${sectionProducts.length} products):`);
  Object.entries(sectionCategories)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .forEach(([cat, count]) => {
      console.log(`  ${getCategoryLabel(cat)}: ${count}`);
    });
  console.log();
});

console.log('='.repeat(80));
console.log(`NEXT STEP: Review results in ${outputPath}`);
console.log('If satisfied, we\'ll update PocketBase with these categories.');
console.log('='.repeat(80));
