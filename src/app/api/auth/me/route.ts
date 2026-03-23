import { NextResponse } from 'next/server';
import { getCurrentCustomer } from '@/lib/auth';

export async function GET() {
  try {
    const customer = await getCurrentCustomer();
    if (!customer) {
      return NextResponse.json({ customer: null }, { status: 401 });
    }
    return NextResponse.json({ customer });
  } catch {
    return NextResponse.json({ customer: null }, { status: 401 });
  }
}
