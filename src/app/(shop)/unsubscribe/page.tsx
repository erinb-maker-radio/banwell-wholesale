'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Button from '@/components/ui/Button';

export default function UnsubscribePage() {
  const searchParams = useSearchParams();
  const emailParam = searchParams.get('email') || '';

  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleUnsubscribe() {
    if (!emailParam) return;
    setLoading(true);

    try {
      await fetch('/api/subscribe/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailParam }),
      });
    } catch {
      // Still show success for privacy
    }

    setDone(true);
    setLoading(false);
  }

  if (done) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Unsubscribed</h1>
          <p className="text-gray-600">
            You&rsquo;ve been removed from our mailing list and won&rsquo;t receive further emails.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Unsubscribe</h1>
        {emailParam ? (
          <>
            <p className="text-gray-600 mb-6">
              Click below to unsubscribe <strong>{emailParam}</strong> from Banwell Designs emails.
            </p>
            <Button
              onClick={handleUnsubscribe}
              disabled={loading}
              variant="danger"
            >
              {loading ? 'Processing...' : 'Confirm Unsubscribe'}
            </Button>
          </>
        ) : (
          <p className="text-gray-600">
            Invalid unsubscribe link. Please use the link from your email.
          </p>
        )}
      </div>
    </div>
  );
}
