'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/ui/Button';

export default function ThankYouPage() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('order');

  return (
    <div className="max-w-lg mx-auto text-center py-12">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Placed!</h1>

      {orderNumber && (
        <p className="text-lg text-gray-600 mb-4">Order #{orderNumber}</p>
      )}

      <p className="text-gray-500 mb-8">
        Thank you for your order. You&apos;ll receive a confirmation email shortly.
        We&apos;ll keep you updated as your order is processed.
      </p>

      <div className="flex gap-4 justify-center">
        <Link href="/account/orders">
          <Button variant="secondary">View Orders</Button>
        </Link>
        <Link href="/catalog">
          <Button>Continue Shopping</Button>
        </Link>
      </div>
    </div>
  );
}
