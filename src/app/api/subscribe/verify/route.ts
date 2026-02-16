import { NextResponse } from 'next/server';
import { createServerPB, authenticateAdmin } from '@/lib/pocketbase';

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

    const pb = createServerPB();
    await authenticateAdmin(pb);

    try {
      const subscriber = await pb.collection('subscribers').getFirstListItem(
        `discount_code="${code}" && status="active"`
      );

      return NextResponse.json({
        success: true,
        valid: true,
        used: subscriber.discount_used,
      });
    } catch {
      return NextResponse.json({
        success: true,
        valid: false,
        used: false,
      });
    }
  } catch (err) {
    console.error('Verify error:', err);
    return NextResponse.json(
      { success: false, error: 'Verification failed.' },
      { status: 500 }
    );
  }
}
