import { NextResponse } from 'next/server';
import { createServerPB, authenticateAdmin } from '@/lib/pocketbase';
import { notifyNewCustomer } from '@/lib/notifications';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, passwordConfirm, business_name, contact_name, phone, address, city, state, zip, website } = body;

    if (!email || !password || !business_name || !contact_name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }

    if (password !== passwordConfirm) {
      return NextResponse.json({ error: 'Passwords do not match' }, { status: 400 });
    }

    const pb = createServerPB();
    await authenticateAdmin(pb);

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
    // Extract PocketBase validation errors
    const pbErr = err as { response?: { data?: Record<string, { message: string }> }; message?: string };
    if (pbErr?.response?.data) {
      const fields = pbErr.response.data;
      const firstKey = Object.keys(fields)[0];
      if (firstKey === 'email' && fields[firstKey].message?.includes('unique')) {
        return NextResponse.json({ error: 'An account with this email already exists' }, { status: 400 });
      }
      return NextResponse.json({ error: fields[firstKey]?.message || 'Registration failed' }, { status: 400 });
    }
    const message = err instanceof Error ? err.message : 'Registration failed';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
