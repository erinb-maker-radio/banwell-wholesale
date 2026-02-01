import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerPB } from '@/lib/pocketbase';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const authCookie = cookieStore.get('pb_auth');

    if (!authCookie?.value) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const pb = createServerPB();
    pb.authStore.save(authCookie.value);

    if (!pb.authStore.isValid) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const result = await pb.collection('customers').authRefresh();

    return NextResponse.json({
      success: true,
      data: result.record,
    });
  } catch {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }
}
