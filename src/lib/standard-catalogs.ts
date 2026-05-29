import type PocketBase from 'pocketbase';

// Customer segments and the product categories (by slug) that make up each
// segment's standard "My Catalog". Masks are leather, so leather = masks +
// plague-doctor accessories.
export type CustomerType = 'mask' | 'leather' | 'glass' | 'paper' | 'general';

export const STANDARD_CATALOGS: Record<CustomerType, string[]> = {
  mask: ['fashion-masks', 'plague-doctor-masks'],
  leather: ['fashion-masks', 'plague-doctor-masks', 'plague-doctor-accessories'],
  glass: ['glass-ornaments', 'glass-sun-catchers'],
  paper: ['paper-cut-ornaments'],
  general: [],
};

// Replace a customer's curated_products with the standard catalog for their
// type. `pb` MUST be admin-authenticated (writes to other customers' rows).
// Returns the number of curated products set. No-op for unknown/general types.
export async function curateCustomerByType(
  pb: PocketBase,
  customerId: string,
  type: string | undefined,
): Promise<number> {
  const slugs = STANDARD_CATALOGS[(type || '') as CustomerType] || [];
  if (slugs.length === 0) return 0;

  // Resolve category ids for the slugs
  const catFilter = slugs.map(s => `slug="${s}"`).join(' || ');
  const cats = await pb.collection('product_categories').getFullList({ filter: catFilter });
  if (cats.length === 0) return 0;

  // Active products in those categories
  const prodFilter = '(' + cats.map(c => `category="${c.id}"`).join(' || ') + ') && is_active=true';
  const products = await pb.collection('products').getFullList({ filter: prodFilter, sort: 'sort_order' });

  // Clear any existing curated rows for this customer (idempotent re-curate)
  const existing = await pb.collection('curated_products').getFullList({ filter: `customer="${customerId}"` });
  for (const row of existing) {
    await pb.collection('curated_products').delete(row.id);
  }

  // Insert the new standard catalog
  let i = 0;
  for (const p of products) {
    await pb.collection('curated_products').create({ customer: customerId, product: p.id, sort_order: i });
    i++;
  }
  return i;
}
