import { cookies } from 'next/headers';
import { createServerPB } from './pocketbase';
import type { Customer } from './types';

const AUTH_COOKIE = 'pb_auth';

// Register a new wholesale customer
export async function registerCustomer(data: {
  email: string;
  password: string;
  passwordConfirm: string;
  business_name: string;
  contact_name: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  website?: string;
}): Promise<Customer> {
  const pb = createServerPB();

  const record = await pb.collection('customers').create({
    ...data,
    status: 'pending',
    discount_tier: 'auto',
  });

  return record as unknown as Customer;
}

// Login a customer
export async function loginCustomer(email: string, password: string): Promise<{ token: string; customer: Customer }> {
  const pb = createServerPB();

  const authData = await pb.collection('customers').authWithPassword(email, password);

  return {
    token: authData.token,
    customer: authData.record as unknown as Customer,
  };
}

// Get the current customer from auth cookie (server-side)
export async function getCurrentCustomer(): Promise<Customer | null> {
  try {
    const cookieStore = await cookies();
    const authCookie = cookieStore.get(AUTH_COOKIE);

    if (!authCookie?.value) return null;

    const pb = createServerPB();
    pb.authStore.save(authCookie.value);

    if (!pb.authStore.isValid) return null;

    // Refresh the auth record
    const record = await pb.collection('customers').authRefresh();
    return record.record as unknown as Customer;
  } catch {
    return null;
  }
}

// Check if user is authenticated (server-side)
export async function isAuthenticated(): Promise<boolean> {
  const customer = await getCurrentCustomer();
  return customer !== null;
}
