#!/usr/bin/env node
const PocketBase = require('pocketbase').default;
const pb = new PocketBase('http://127.0.0.1:8094');

const productIds = [
  'odu0cz31t369l93', 'ibx5v90s721793q', 'h105zsnp29o4tna',
  'w159472714y73qa', 'a7newa79x4ebg60', '9g917lje6h1lm70',
  '874ry6g47tzt1o3', '99ik0q0w0dhxa4f', '4ps1r7cw565i8g3',
  'cn4p1r9e380626y', '92jw51b1xm575d1', 'a595osvwrc310fr',
  'j3v597jm5u2mzoj', '2gh6i3s0w59f107', '714522h3gpz8308'
];

async function getSkus() {
  await pb.admins.authWithPassword('admin@banwelldesigns.com', 'changeme123');
  
  console.log('const PRODUCT_SKUS = [');
  for (const id of productIds) {
    try {
      const p = await pb.collection('products').getOne(id);
      console.log(`  "${p.sku}", // ${p.short_title || p.title}`);
    } catch (e) {
      console.log(`  // ERROR: ${id}`);
    }
  }
  console.log('];');
}

getSkus();
