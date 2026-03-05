import { NextResponse } from 'next/server';
import { createServerPB, authenticateAdmin } from '@/lib/pocketbase';
import { sendWelcomeEmail, notifyNewSubscriber } from '@/lib/notifications';
import { getCurrentCode } from '@/lib/discount-codes';
import type { SubscriberSource, SubscriberType } from '@/lib/types';

const VALID_SOURCES: SubscriberSource[] = [
  'website_popup', 'website_footer', 'website_landing',
  'etsy_insert', 'etsy_message', 'manual',
];
const VALID_TYPES: SubscriberType[] = ['retail', 'wholesale'];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, name, source, type } = body;

    // Validate email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    const subscriberSource: SubscriberSource = VALID_SOURCES.includes(source) ? source : 'website_landing';
    const subscriberType: SubscriberType = VALID_TYPES.includes(type) ? type : 'retail';

    const pb = createServerPB();
    await authenticateAdmin(pb);

    // Check for existing subscriber
    try {
      const existing = await pb.collection('subscribers').getFirstListItem(`email="${email}"`);

      if (existing.status === 'active') {
        // Already active — return current month's code
        return NextResponse.json({
          success: true,
          alreadySubscribed: true,
          discountCode: getCurrentCode(),
          message: "You're already subscribed! Here's your discount code.",
        });
      }

      // Previously unsubscribed — reactivate
      const reactivateCode = getCurrentCode();
      await pb.collection('subscribers').update(existing.id, {
        status: 'active',
        source: subscriberSource,
        type: subscriberType,
        discount_code: reactivateCode,
        opted_in_at: new Date().toISOString(),
        ...(name ? { name } : {}),
      });

      // Fire-and-forget: send welcome email + push
      sendWelcomeEmail({ email, name: name || existing.name, discountCode: reactivateCode }).catch(() => {});
      notifyNewSubscriber({ email, type: subscriberType, source: subscriberSource }).catch(() => {});

      return NextResponse.json({
        success: true,
        reactivated: true,
        discountCode: reactivateCode,
        message: 'Welcome back! Your discount code is still valid.',
      });
    } catch {
      // Not found — create new subscriber
    }

    const newCode = getCurrentCode();
    await pb.collection('subscribers').create({
      email,
      name: name || '',
      type: subscriberType,
      source: subscriberSource,
      discount_code: newCode,
      discount_used: false,
      opted_in_at: new Date().toISOString(),
      status: 'active',
    });

    // Fire-and-forget: send welcome email + push
    sendWelcomeEmail({ email, name, discountCode: newCode }).catch(() => {});
    notifyNewSubscriber({ email, type: subscriberType, source: subscriberSource }).catch(() => {});

    return NextResponse.json({
      success: true,
      discountCode: newCode,
      message: 'You\'re subscribed! Check your email for your discount code.',
    });
  } catch (err) {
    console.error('Subscribe error:', err);
    return NextResponse.json(
      { success: false, error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
