import { NextResponse } from 'next/server';
import { createServerPB, authenticateAdmin } from '@/lib/pocketbase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required.' },
        { status: 400 }
      );
    }

    const pb = createServerPB();
    await authenticateAdmin(pb);

    // Always return success regardless of whether email exists (privacy)
    try {
      const subscriber = await pb.collection('subscribers').getFirstListItem(`email="${email}"`);
      await pb.collection('subscribers').update(subscriber.id, {
        status: 'unsubscribed',
      });
    } catch {
      // Email not found — still return success for privacy
    }

    return NextResponse.json({
      success: true,
      message: 'You have been unsubscribed.',
    });
  } catch (err) {
    console.error('Unsubscribe error:', err);
    return NextResponse.json(
      { success: false, error: 'Something went wrong.' },
      { status: 500 }
    );
  }
}
