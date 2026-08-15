'use client';

import { useState } from 'react';
import { SIZES, type SizeKey } from './data';

// Interactive order island for the general DTC page. Posts to the shared
// /api/vet/checkout endpoint with slug="direct" so the order is tagged as a
// direct (non-referral) sale — zero commission, referenceId "direct".
export default function OrderForm() {
  const [selectedSize, setSelectedSize] = useState<SizeKey>('10"');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [promo, setPromo] = useState('');
  const [isGift, setIsGift] = useState(false);
  const [giftNote, setGiftNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const selectedSizeInfo = SIZES.find(s => s.key === selectedSize)!;

  async function handleOrder() {
    setError('');
    const email = customerEmail.trim();
    // Email is required — it's how we send the artwork proof to approve before
    // anything is made. Validate here so the buyer gets a friendly message
    // instead of a raw Square "invalid email" rejection.
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email — we use it to send your artwork proof to approve before we make anything.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/vet/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: 'direct',
          size: selectedSize,
          customerName,
          customerEmail: email,
          promo: promo.trim() || undefined,
          isGift,
          giftNote: isGift ? giftNote.trim() : '',
          origin: typeof window !== 'undefined' ? window.location.origin : undefined,
        }),
      });
      const data = await res.json();
      if (data.checkoutUrl) {
        // keepalive lets the beacon survive the redirect to Square.
        fetch('/api/vet/event', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'checkout_created',
            path: window.location.pathname,
            meta: selectedSize,
          }),
          keepalive: true,
        }).catch(() => {});
        window.location.href = data.checkoutUrl;
      } else {
        setError(data.error || 'Something went wrong. Please try again or email erin@banwelldesigns.com.');
      }
    } catch {
      setError('Something went wrong. Please try again or email erin@banwelldesigns.com.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section>
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Order your portrait</h2>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Choose a size</label>
        <div className="space-y-2">
          {SIZES.map(size => (
            <label
              key={size.key}
              className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                selectedSize === size.key
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="size"
                value={size.key}
                checked={selectedSize === size.key}
                onChange={() => setSelectedSize(size.key)}
                className="mt-0.5 accent-blue-600"
              />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline">
                  <span className="font-medium text-gray-900">{size.key}</span>
                  <span className="font-semibold text-gray-900">${size.price}</span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{size.description}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-3 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="name">
            Your name <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <input
            id="name"
            type="text"
            value={customerName}
            onChange={e => setCustomerName(e.target.value)}
            placeholder="Jane Smith"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
            Email <span className="text-gray-400 font-normal">(we send your artwork proof here to approve before we make it)</span>
          </label>
          <input
            id="email"
            type="email"
            required
            value={customerEmail}
            onChange={e => setCustomerEmail(e.target.value)}
            placeholder="jane@example.com"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="promo">
            Promo code <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <input
            id="promo"
            type="text"
            value={promo}
            onChange={e => setPromo(e.target.value)}
            placeholder="GLASS15"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm uppercase focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <label className="flex items-start gap-2 cursor-pointer pt-1">
          <input
            type="checkbox"
            checked={isGift}
            onChange={e => setIsGift(e.target.checked)}
            className="mt-0.5 accent-blue-600"
          />
          <span className="text-sm text-gray-700">
            This is a gift
            <span className="block text-xs text-gray-400 font-normal mt-0.5">
              After checkout you&apos;ll get a link you can share with the recipient so they can
              send us the photo themselves &mdash; or upload it yourself.
            </span>
          </span>
        </label>
        {isGift && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="giftnote">
              Gift note <span className="text-gray-400 font-normal">(optional, included with the piece)</span>
            </label>
            <textarea
              id="giftnote"
              value={giftNote}
              onChange={e => setGiftNote(e.target.value)}
              maxLength={500}
              rows={2}
              placeholder="With love, from all of us."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        )}
      </div>

      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
      <button
        onClick={handleOrder}
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors text-base"
      >
        {loading ? 'Preparing your order...' : `Order ${selectedSize} — $${selectedSizeInfo.price}`}
      </button>
      <p className="text-xs text-gray-400 mt-2 text-center">
        Secure checkout via Square &middot; Afterpay available at checkout &middot; We collect
        your photo after payment
      </p>
      <p className="text-xs text-gray-500 mt-1 text-center">
        Or 4 interest-free payments of ${Math.round(selectedSizeInfo.price / 4)} with Afterpay
      </p>
    </section>
  );
}
