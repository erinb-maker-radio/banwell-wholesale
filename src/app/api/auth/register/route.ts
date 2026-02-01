import { NextResponse } from 'next/server';
import { createServerPB } from '@/lib/pocketbase';
import { notifyNewCustomer } from '@/lib/notifications';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, passwordConfirm, business_name, contact_name, phone, address, city, state, zip, website } = body;

    if (!email || !password || !business_name || !contact_name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (password !== passwordConfirm) {
      return NextResponse.json({ error: 'Passwords do not match' }, { status: 400 });
    }

    const pb = createServerPB();

    const customer = await pb.collection('customers').create({
      email,
      password,
      passwordConfirm,
      business_name,
      contact_name,
      phone: phone || '',
      address: address || '',
      city: city || '',
      state: state || '',
      zip: zip || '',
      website: website || '',
      status: 'pending',
      discount_tier: 'auto',
    });

    // Notify admin
    notifyNewCustomer({ business_name, contact_name, email }).catch(console.error);

    return NextResponse.json({ success: true, data: { id: customer.id } });
  } catch (err: unknown) {
    console.error('Registration error:', err);
    const message = err instanceof Error ? err.message : 'Registration failed';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
