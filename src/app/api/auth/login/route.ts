import { NextResponse } from 'next/server';
import { createServerPB } from '@/lib/pocketbase';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }

    const pb = createServerPB();
    const authData = await pb.collection('customers').authWithPassword(email, password);

    const response = NextResponse.json({
      success: true,
      data: {
        id: authData.record.id,
        email: authData.record.email,
        business_name: authData.record.business_name,
        contact_name: authData.record.contact_name,
      },
    });

    // Set auth cookie
    response.cookies.set('pb_auth', authData.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
  }
}
