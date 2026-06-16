const PocketBase = require('pocketbase').default;
const pb = new PocketBase('http://127.0.0.1:8094');

const GLASS_CATEGORY = '94b2o8bejgv87z4';
const SIZES = [
  { size: '3"', sku: 'ORN-340', price: 3500 },
  { size: '6"', sku: 'SUN-340-6', price: 7200 },
  { size: '10"', sku: 'SUN-340-10', price: 9800 },
  { size: '12"', sku: 'SUN-340-12', price: 11900 },
  { size: '15"', sku: 'SUN-340-15', price: 15300 }
];

async function main() {
  await pb.collection('_superusers').authWithPassword('admin@banwelldesigns.com', 'changeme123');
  
  console.log('Creating Red Panda products...\n');
  
  // Use placeholder image
  const imageUrl = 'https://i.etsystatic.com/5128790/r/il/be0ec9/6348876632/il_794xN.6348876632_h9cl.jpg';
  
  for (const { size, sku, price } of SIZES) {
    try {
      const existing = await pb.collection('products').getFirstListItem(`sku="${sku}"`);
      console.log(`EXISTS: ${sku}`);
    } catch {
      const title = size === '3"' 
        ? 'Red Panda: Stained Glass-Style Christmas Ornament - Made With Real Glass'
        : 'Red Panda';
      await pb.collection('products').create({
        sku,
        title,
        short_title: 'Red Panda',
        size,
        retail_price: price,
        image_url: imageUrl,
        category: GLASS_CATEGORY,
        is_active: true
      });
      console.log(`CREATE: ${sku} ${size} - $${price/100}`);
    }
  }
  
  console.log('\n✓ Done!');
}

main().catch(console.error);
