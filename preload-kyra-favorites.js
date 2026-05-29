#!/usr/bin/env node
/**
 * Preload a list of products into a customer's "favorites" on
 * wholesale.banwelldesigns.com. Used when a buyer hands us a written/
 * verbal order and we want it waiting in their account.
 *
 * Usage: edit CUSTOMER_EMAIL and PRODUCT_SKUS below, then run:
 *   node preload-favorites.js
 *
 * Pattern source: mirrors create-kyra-account.js in this same directory.
 */

const PocketBase = require("pocketbase").default || require("pocketbase");

const PB_URL    = "http://127.0.0.1:8094";
const PB_ADMIN  = "admin@banwelldesigns.com";
const PB_PASS   = "changeme123";

// ----- edit these two -----
const CUSTOMER_EMAIL = "info@amasquerade.com";
const PRODUCT_SKUS = [
  "FM-003", // Bemused
  "FM-004", // Raven
  "FM-005", // Wolf
  "FM-006", // Falconer
  "FM-008", // Wildcat
  "FM-012", // Roxy
  "FM-013", // Incognito
  "FM-025", // Eye Cage
  "FM-027", // Hex
  "FM-030", // Creature
  "FM-037", // Half Hearts
  "FM-015", // Victoriana for Eyeglasses
  "FM-017", // Swirly for Eyeglasses
  "FM-026", // Coquette for Eyeglasses
  "FM-035", // Snowflake for Eyeglasses
];
// --------------------------

async function main() {
  const pb = new PocketBase(PB_URL);
  await pb.admins.authWithPassword(PB_ADMIN, PB_PASS);
  console.log("✓ admin auth");

  // 1. Find the customer
  const customer = await pb.collection("customers").getFirstListItem(
    `email = "${CUSTOMER_EMAIL}"`
  );
  console.log(`✓ customer ${customer.id} (${customer.business_name})`);

  // 2. Resolve each SKU → product id
  const products = [];
  for (const sku of PRODUCT_SKUS) {
    try {
      const p = await pb.collection("products").getFirstListItem(`sku = "${sku}"`);
      products.push(p);
    } catch (e) {
      console.error(`✗ SKU not found in products collection: ${sku}`);
    }
  }
  console.log(`✓ resolved ${products.length}/${PRODUCT_SKUS.length} products`);

  // 3. Skip products already favorited (avoid duplicates)
  const existing = await pb.collection("favorites").getFullList({
    filter: `customer = "${customer.id}"`,
  });
  const already = new Set(existing.map(f => f.product));

  // 4. Insert one favorites record per new product
  let created = 0;
  for (const p of products) {
    if (already.has(p.id)) {
      console.log(`  skip (already favorite): ${p.sku || p.name}`);
      continue;
    }
    await pb.collection("favorites").create({ customer: customer.id, product: p.id });
    created++;
    console.log(`  + ${p.sku || p.name}`);
  }
  console.log(`✓ done: ${created} new favorite(s) added`);
}

main().catch(err => {
  console.error("FAILED:", err?.response?.data || err.message || err);
  process.exit(1);
});
