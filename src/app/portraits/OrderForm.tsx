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
      <h2 className="font-display text-2xl md:text-3xl text-[#232946] mb-1">Order your portrait</h2>
      <p className="text-sm text-[#232946]/60 mb-6">
        Pick a size now &mdash; we collect your photo right after checkout.
      </p>

      <div className="mb-6">
        <label className="block text-sm font-medium text-[#232946]/80 mb-2">Choose a size</label>
        <div className="space-y-2">
          {SIZES.map(size => (
            <label
              key={size.key}
              className={`relative flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-colors ${
                selectedSize === size.key
                  ? 'border-[#d4a33d] bg-[#f3ecdb] ring-1 ring-[#d4a33d]'
                  : 'border-[#232946]/15 hover:border-[#232946]/30'
              }`}
            >
              <input
                type="radio"
                name="size"
                value={size.key}
                checked={selectedSize === size.key}
                onChange={() => setSelectedSize(size.key)}
                className="mt-0.5 accent-[#a8823a]"
              />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline gap-2">
                  <span className="font-semibold text-[#232946]">
                    {size.key}
                    {size.key === '10"' && (
                      <span className="ml-2 text-[10px] font-bold uppercase tracking-wide bg-[#d4a33d] text-[#232946] rounded-full px-2 py-0.5 align-middle">
                        Most popular
                      </span>
                    )}
                  </span>
                  <span className="font-semibold text-[#232946]">${size.price}</span>
                </div>
                <p className="text-xs text-[#232946]/60 mt-0.5">{size.description}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-3 mb-6">
        <div>
          <label className="block text-sm font-medium text-[#232946]/80 mb-1" htmlFor="name">
            Your name <span className="text-[#232946]/45 font-normal">(optional)</span>
          </label>
          <input
            id="name"
            type="text"
            value={customerName}
            onChange={e => setCustomerName(e.target.value)}
            placeholder="Jane Smith"
            className="w-full border border-[#232946]/25 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#d4a33d] focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#232946]/80 mb-1" htmlFor="email">
            Email <span className="text-[#232946]/45 font-normal">(we send your artwork proof here to approve before we make it)</span>
          </label>
          <input
            id="email"
            type="email"
            required
            value={customerEmail}
            onChange={e => setCustomerEmail(e.target.value)}
            placeholder="jane@example.com"
            className="w-full border border-[#232946]/25 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#d4a33d] focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#232946]/80 mb-1" htmlFor="promo">
            Promo code <span className="text-[#232946]/45 font-normal">(optional)</span>
          </label>
          <input
            id="promo"
            type="text"
            value={promo}
            onChange={e => setPromo(e.target.value)}
            placeholder="GLASS15"
            className="w-full border border-[#232946]/25 rounded-xl px-3 py-2.5 text-sm uppercase focus:outline-none focus:ring-2 focus:ring-[#d4a33d] focus:border-transparent"
          />
        </div>
        <label className="flex items-start gap-2 cursor-pointer pt-1">
          <input
            type="checkbox"
            checked={isGift}
            onChange={e => setIsGift(e.target.checked)}
            className="mt-0.5 accent-[#a8823a]"
          />
          <span className="text-sm text-[#232946]/80">
            This is a gift
            <span className="block text-xs text-[#232946]/45 font-normal mt-0.5">
              After checkout you&apos;ll get a link you can share with the recipient so they can
              send us the photo themselves &mdash; or upload it yourself.
            </span>
          </span>
        </label>
        {isGift && (
          <div>
            <label className="block text-sm font-medium text-[#232946]/80 mb-1" htmlFor="giftnote">
              Gift note <span className="text-[#232946]/45 font-normal">(optional, included with the piece)</span>
            </label>
            <textarea
              id="giftnote"
              value={giftNote}
              onChange={e => setGiftNote(e.target.value)}
              maxLength={500}
              rows={2}
              placeholder="With love, from all of us."
              className="w-full border border-[#232946]/25 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#d4a33d] focus:border-transparent"
            />
          </div>
        )}
      </div>

      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
      <button
        onClick={handleOrder}
        disabled={loading}
        className="w-full bg-[#d4a33d] hover:bg-[#c2922f] disabled:opacity-60 disabled:cursor-not-allowed text-[#232946] font-semibold py-3.5 px-6 rounded-xl transition-colors text-base shadow-sm"
      >
        {loading ? 'Preparing your order...' : `Order ${selectedSize} — $${selectedSizeInfo.price}`}
      </button>
      <p className="text-xs text-[#232946]/45 mt-2.5 text-center">
        Secure checkout via Square &middot; Afterpay available at checkout &middot; We collect
        your photo after payment
      </p>
      <p className="text-xs text-[#232946]/60 mt-1 text-center">
        Or 4 interest-free payments of ${Math.round(selectedSizeInfo.price / 4)} with Afterpay
      </p>
    </section>
  );
}
