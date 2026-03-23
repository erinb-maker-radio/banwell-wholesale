import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedPB } from '@/lib/auth';

export async function GET() {
  const auth = await getAuthenticatedPB();
  if (!auth) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  try {
    const customer = await auth.pb.collection('customers').getOne(auth.customerId);
    return NextResponse.json({ customer });
  } catch (err) {
    console.error('Failed to load settings:', err);
    return NextResponse.json({ error: 'Failed to load settings' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const auth = await getAuthenticatedPB();
  if (!auth) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  try {
    const body = await req.json();
    // Only allow updating safe fields
    const allowed = ['business_name', 'contact_name', 'phone', 'address', 'city', 'state', 'zip', 'website'];
    const updates: Record<string, string> = {};
    for (const key of allowed) {
      if (key in body) updates[key] = body[key];
    }

    await auth.pb.collection('customers').update(auth.customerId, updates);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Failed to update settings:', err);
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
}
