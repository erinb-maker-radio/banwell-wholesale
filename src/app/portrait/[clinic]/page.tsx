'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useParams } from 'next/navigation';

const SIZES = [
  { key: '3"',  label: '3"',  price: 135, description: 'Ornament size — hangs in a window or on a tree' },
  { key: '6"',  label: '6"',  price: 172, description: 'Small suncatcher — perfect for a desk or bedside window' },
  { key: '10"', label: '10"', price: 198, description: 'Our most popular size — fills a window beautifully' },
  { key: '12"', label: '12"', price: 229, description: 'Large statement piece' },
  { key: '15"', label: '15"', price: 253, description: 'Gallery size — maximum impact' },
] as const;

type SizeKey = (typeof SIZES)[number]['key'];

const HOW_IT_WORKS = [
  {
    step: '1',
    title: 'Order your portrait',
    body: 'Choose the size you want and complete your purchase. We\'ll follow up by email to collect your photo.',
  },
  {
    step: '2',
    title: 'Send us your favorite photo',
    body: 'Any clear photo of your pet works — we handle all the design work from there.',
  },
  {
    step: '3',
    title: 'Approve your artwork',
    body: 'We send you a digital proof before anything is made. You approve it, we print it.',
  },
  {
    step: '4',
    title: 'We make it and ship it',
    body: 'Printed on real glass and sealed. Ships within 1–2 weeks of artwork approval.',
  },
];

export default function PortraitPage() {
  const params = useParams();
  const slug = (params?.clinic as string) || '';

  const [selectedSize, setSelectedSize] = useState<SizeKey>('10"');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fire-and-forget scan tracking on mount
  useEffect(() => {
    if (!slug) return;
    fetch('/api/vet/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug }),
    }).catch(() => {
      // Silent — tracking failure must never break the page
    });
  }, [slug]);

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
        body: JSON.stringify({ slug, size: selectedSize, customerName, customerEmail: email }),
      });
      const data = await res.json();
      if (data.checkoutUrl) {
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

  const selectedSizeInfo = SIZES.find(s => s.key === selectedSize)!;

  return (
    <div className="max-w-4xl mx-auto px-4">

      {/* ── HERO ── */}
      <section className="pt-10 pb-8 text-center">
        <h1 className="text-3xl md:text-5xl font-semibold text-gray-900 leading-tight mb-4">
          A Stained Glass Style Portrait
          <br className="hidden md:block" /> of Your Pet
        </h1>
        <p className="text-lg text-gray-500 max-w-xl mx-auto leading-relaxed">
          We turn your favorite photo into a handmade suncatcher — designed and made by my wife
          and I in Chico, California.
        </p>
      </section>

      {/* ── HERO IMAGE ── */}
      {/* Real customer photo: a stained-glass-style pet portrait hanging in the
          buyer's window. Sourced from an Etsy purchase photo. */}
      <section className="mb-10">
        <div className="relative w-full aspect-[4/3] md:aspect-[16/9] rounded-2xl overflow-hidden shadow-lg">
          <Image
            src="/images/vet/bulldog-window.jpg"
            alt="Stained glass style dog portrait suncatcher glowing in a customer's window"
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, 900px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6">
            <p className="text-white text-sm md:text-base font-light">
              Printed on real glass &middot; Ships in 1&ndash;2 weeks after artwork approval
            </p>
          </div>
        </div>
      </section>

      {/* ── TWO-COLUMN: ORDER FORM + HOW IT WORKS ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-16">

        {/* Order form */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Order your portrait</h2>

          {/* Size picker */}
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

          {/* Optional contact fields */}
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
          </div>

          {/* CTA */}
          {error && (
            <p className="text-sm text-red-600 mb-3">{error}</p>
          )}
          <button
            onClick={handleOrder}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors text-base"
          >
            {loading
              ? 'Preparing your order...'
              : `Order ${selectedSize} — $${selectedSizeInfo.price}`}
          </button>
          <p className="text-xs text-gray-400 mt-2 text-center">
            Secure checkout via Square &middot; We collect your photo after payment
          </p>
        </section>

        {/* How it works */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">How it works</h2>
          <ol className="space-y-6">
            {HOW_IT_WORKS.map(step => (
              <li key={step.step} className="flex gap-4">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-bold flex items-center justify-center">
                  {step.step}
                </span>
                <div>
                  <p className="font-semibold text-gray-900">{step.title}</p>
                  <p className="text-sm text-gray-500 mt-0.5 leading-relaxed">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </div>

      {/* ── SOCIAL PROOF ── */}
      <section className="border-t border-gray-100 pt-10 pb-4 text-center mb-4">
        <p className="text-2xl font-semibold text-gray-900 mb-2">4.9 stars &middot; 2,600+ five-star reviews</p>
        <p className="text-gray-500 text-sm max-w-lg mx-auto">
          Designed and made in Chico, California. Each piece is printed on real glass and hand-finished.
          Not mass produced.
        </p>
      </section>

      {/* ── SAMPLE REVIEWS (static, from Etsy) ── */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-12">
        {([
          {
            quote: 'We had a custom made sun catcher of our beloved dog who recently passed. It came out so beautiful and looked just like the picture I sent in. This is something we will cherish!',
            author: 'Alicia',
            meta: '12&Prime; portrait &middot; verified Etsy purchase',
            photo: '/images/vet/bulldog-window.jpg',
          },
          {
            quote: 'The owner worked with me to create a custom design to replicate the picture I sent, was responsive, and shipped on time. The item itself looks and feels high quality.',
            author: 'Rommelyn',
            meta: 'Custom order &middot; verified Etsy purchase',
            photo: '/images/vet/balloon-window.jpg',
          },
          {
            quote: 'Was blown away by the details and incredible work. Such great quality and such a pleasure to work with. Definitely recommend!',
            author: 'Etsy buyer',
            meta: 'Custom order &middot; verified Etsy purchase',
            photo: '/images/vet/tree-213.jpg',
          },
        ] as Array<{ quote: string; author: string; meta: string; photo?: string }>).map(review => (
          <div key={review.author} className="bg-gray-50 rounded-xl p-5">
            <div className="text-yellow-400 text-sm mb-2">&#9733;&#9733;&#9733;&#9733;&#9733;</div>
            {review.photo && (
              <div className="relative w-full aspect-square rounded-lg overflow-hidden mb-3">
                <Image
                  src={review.photo}
                  alt={`Customer photo from ${review.author}'s order`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 300px"
                />
              </div>
            )}
            <p className="text-gray-700 text-sm leading-relaxed italic mb-3">&ldquo;{review.quote}&rdquo;</p>
            <p className="text-xs text-gray-500 font-medium">{review.author}</p>
            <p className="text-[11px] text-gray-400 mt-0.5" dangerouslySetInnerHTML={{ __html: review.meta }} />
          </div>
        ))}
      </section>

    </div>
  );
}
