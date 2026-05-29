#!/usr/bin/env node

const PocketBase = require('pocketbase').default;

const pb = new PocketBase('http://127.0.0.1:8094');

async function createKyraAccount() {
  try {
    // Authenticate as admin
    await pb.admins.authWithPassword('admin@banwelldesigns.com', 'changeme123');
    console.log('✓ Authenticated as admin');

    // Create customer account for Kyra
    const customerData = {
      business_name: 'A Masquerade Costume',
      contact_name: 'Kyra',
      email: 'info@amasquerade.com',
      password: 'temp' + Math.random().toString(36).substring(2, 15), // temp password
      passwordConfirm: 'temp' + Math.random().toString(36).substring(2, 15),
      status: 'active',
      discount_tier: 'tier3', // $1,209 order qualifies for tier 3
      notes: 'First wholesale buyer! Fashion masks specialty shop. Order placed 2026-05-27.',
      verified: true,
    };

    // Use same password for both fields
    const tempPassword = 'masquerade2026!';
    customerData.password = tempPassword;
    customerData.passwordConfirm = tempPassword;

    const customer = await pb.collection('customers').create(customerData);
    console.log(`✓ Customer account created: ${customer.id}`);
    console.log(`  Email: ${customer.email}`);
    console.log(`  Temp password: ${tempPassword}`);
    console.log(`  Business: ${customer.business_name}`);

    // Now get product SKUs to create cart items
    // We need to map the order items to product IDs
    console.log('\n✓ Customer account ready!');
    console.log(`  Login URL: https://wholesale.banwelldesigns.com/login`);
    console.log(`  Kyra can log in with:`);
    console.log(`    Email: info@amasquerade.com`);
    console.log(`    Password: ${tempPassword}`);
    console.log(`\n  She should change her password after first login.`);

    return customer;
  } catch (error) {
    console.error('Error creating account:', error);
    if (error.response) {
      console.error('Response:', await error.response.json());
    }
    process.exit(1);
  }
}

createKyraAccount();
