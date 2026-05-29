#!/usr/bin/env node

const PocketBase = require('pocketbase').default;
const pb = new PocketBase('http://127.0.0.1:8094');

async function checkFavorites() {
  try {
    await pb.admins.authWithPassword('admin@banwelldesigns.com', 'changeme123');
    
    const customer = await pb.collection('customers').getFirstListItem('email="info@amasquerade.com"');
    
    const favorites = await pb.collection('favorites').getFullList({
      filter: `customer="${customer.id}"`
    });

    console.log(`Kyra has ${favorites.length} favorites:`);
    favorites.forEach(f => console.log(`  - ${f.product}`));

  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkFavorites();
