#!/usr/bin/env node
/**
 * Test product categorization
 * Shows sample categorization results before applying to database
 */

import { categorizeProduct, getCategoryLabel } from '../src/lib/product-taxonomy';
import * as fs from 'fs';
import * as path from 'path';

// Sample products to test
const SAMPLE_PRODUCTS = [
  'Smoky Mountains: Stained Glass Style Window Hanging',
  'Mountain Range: Stained Glass Style Window Hanging',
  'Borealis Polar Bear: Stained Glass Style Window Hanging',
  'Humpback Whale: Stained Glass Style Window Hanging',
  'Solar System: Stained Glass Style Window Hanging',
  'Jupiter: Stained Glass-Style Christmas Ornament',
  'Cratered Moon: Stained Glass-Style Christmas Ornament',
  'Anatomical Heart: Stained Glass Style Window Hanging',
  'Roaring Dinosaur: Stained Glass Style Window Hanging',
  'Cardinal & Holly: Stained Glass Style Window Hanging',
  'Monarch Butterflies: Paper Cut Ornament',
  'Dogwood: Stained Glass Style Window Hanging',
  'Mighty Oak: Stained Glass Style Window Hanging',
  'Great White Shark: Stained Glass Style Window Hanging',
  'Jellyfish: Stained Glass Style Window Hanging',
  'Erupting Volcano: Stained Glass Style Window Hanging',
  'Aurora Borealis - Northern Lights: Stained Glass Style Window Hanging',
  'Autumn Waterfall: Stained Glass Style Window Hanging',
  'Emperor Penguin: Stained Glass Style Window Hanging',
  'Corgi: Stained Glass Style Window Hanging',
  'Forest Fox: Paper Cut Ornament',
  'Woodland Raccoons: Stained Glass-Style Christmas Ornament',
  'Taj Mahal - Agra, India: Stained Glass-Style Christmas Ornament',
  'Grand Canyon National Park - Arizona: Stained Glass-Style Christmas Ornament'
];

console.log('='.repeat(80));
console.log('PRODUCT CATEGORIZATION TEST');
console.log('='.repeat(80));
console.log();

const results: Array<{ title: string; categories: string[]; labels: string[] }> = [];

SAMPLE_PRODUCTS.forEach(title => {
  const categories = categorizeProduct(title);
  const labels = categories.map(cat => getCategoryLabel(cat));

  results.push({ title, categories, labels });

  console.log(`Product: ${title}`);
  console.log(`Categories (${categories.length}):`);
  if (categories.length === 0) {
    console.log('  (no categories matched)');
  } else {
    labels.forEach(label => console.log(`  - ${label}`));
  }
  console.log();
});

// Summary statistics
console.log('='.repeat(80));
console.log('SUMMARY');
console.log('='.repeat(80));

const categoryCount: Record<string, number> = {};
results.forEach(r => {
  r.categories.forEach(cat => {
    const topLevel = cat.split('.')[0];
    categoryCount[topLevel] = (categoryCount[topLevel] || 0) + 1;
  });
});

console.log('\nProducts per top-level category:');
Object.entries(categoryCount)
  .sort((a, b) => b[1] - a[1])
  .forEach(([cat, count]) => {
    console.log(`  ${cat}: ${count} products`);
  });

const avgCategories = results.reduce((sum, r) => sum + r.categories.length, 0) / results.length;
console.log(`\nAverage categories per product: ${avgCategories.toFixed(1)}`);

const uncategorized = results.filter(r => r.categories.length === 0);
if (uncategorized.length > 0) {
  console.log(`\n⚠️  WARNING: ${uncategorized.length} products have no categories:`);
  uncategorized.forEach(r => console.log(`  - ${r.title}`));
}

// Write results to file
const outputPath = path.join(__dirname, '../data/categorization-test-results.json');
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
console.log(`\nResults written to: ${outputPath}`);

// Example buyer queries
console.log('\n' + '='.repeat(80));
console.log('BUYER TYPE EXAMPLES');
console.log('='.repeat(80));

const buyerExamples = [
  {
    name: 'Smokies Life (State Park)',
    categories: ['location.specific.national_parks', 'wildlife.mammals', 'nature.water']
  },
  {
    name: 'Science Museum of Minnesota',
    categories: ['science.astronomy', 'science.marine_biology', 'space.planets']
  },
  {
    name: 'Aquarium Gift Shop',
    categories: ['wildlife.marine', 'science.marine_biology']
  }
];

buyerExamples.forEach(buyer => {
  console.log(`\n${buyer.name}:`);
  console.log(`Looking for: ${buyer.categories.map(c => getCategoryLabel(c)).join(', ')}`);

  const matches = results.filter(r =>
    r.categories.some(cat => buyer.categories.some(bc => cat.startsWith(bc)))
  );

  console.log(`Found ${matches.length} matching products:`);
  matches.slice(0, 10).forEach(m => {
    const relevantCats = m.categories.filter(cat =>
      buyer.categories.some(bc => cat.startsWith(bc))
    );
    console.log(`  - ${m.title.split(':')[0]} (${relevantCats.map(c => getCategoryLabel(c)).join(', ')})`);
  });
  if (matches.length > 10) {
    console.log(`  ... and ${matches.length - 10} more`);
  }
});

console.log('\n' + '='.repeat(80));
console.log('✅ Categorization test complete!');
console.log('Review results above. If taxonomy looks good, proceed to Phase 2.');
console.log('='.repeat(80));
