'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

function SubscribeForm() {
  const searchParams = useSearchParams();
  const source = searchParams.get('source') || 'website_landing';
  const type = searchParams.get('type') || 'retail';

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [discountCode, setDiscountCode] = useState('');
  const [message, setMessage] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name: name || undefined, source, type }),
      });
      const json = await res.json();

      if (json.success) {
        setDiscountCode(json.discountCode);
        setMessage(json.message);
      } else {
        setError(json.error || 'Something went wrong.');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (discountCode) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">You&rsquo;re In!</h1>
          <p className="text-gray-600 mb-6">{message}</p>
          <div className="bg-red-50 border-2 border-dashed border-[#A22020] rounded-lg p-8 mb-6">
            <p className="text-sm text-gray-500 mb-1">Your Discount Code</p>
            <p className="text-4xl font-bold text-[#A22020] tracking-wider">{discountCode}</p>
          </div>
          <p className="text-sm text-gray-500">
            Check your email for instructions on how to use your code on our website and on Etsy.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Get 25% Off Your First Order</h1>
          <p className="text-gray-600">
            Subscribe to get an exclusive discount code valid on our website and Etsy shop.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Name (optional)"
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          {error && (
            <p className="text-red-600 text-sm">{error}</p>
          )}

          <Button
            type="submit"
            disabled={loading || !email}
            className="w-full !bg-[#A22020] hover:!bg-[#8a1b1b]"
          >
            {loading ? 'Subscribing...' : 'Get My Discount Code'}
          </Button>

          <p className="text-xs text-gray-400 text-center">
            We respect your privacy. Unsubscribe at any time.
          </p>
        </form>
      </div>
    </div>
  );
}

export default function SubscribePage() {
  return (
    <Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center">Loading...</div>}>
      <SubscribeForm />
    </Suspense>
  );
}
