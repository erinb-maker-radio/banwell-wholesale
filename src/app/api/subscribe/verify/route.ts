import { NextResponse } from 'next/server';
import { isValidCode, getCodeDiscount } from '@/lib/discount-codes';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json(
        { success: false, error: 'Discount code is required.' },
        { status: 400 }
      );
    }

    const valid = isValidCode(code);

    return NextResponse.json({
      success: true,
      valid,
      used: false,
      discount: valid ? getCodeDiscount(code) : 0,
    });
  } catch (err) {
    console.error('Verify error:', err);
    return NextResponse.json(
      { success: false, error: 'Verification failed.' },
      { status: 500 }
    );
  }
}
