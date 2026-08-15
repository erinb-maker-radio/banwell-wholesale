import type { Metadata } from 'next';
import Link from 'next/link';

// SHIPPING & RETURNS — stainedglassportraits.com/shipping
// Plain-English policy page. Custom work means the protection happens BEFORE
// production (proof approval), not after — this page explains that honestly.

export const metadata: Metadata = {
  title: 'Shipping & Returns | Banwell Designs',
  description:
    'How your custom stained glass style portrait is made, approved, packed, and shipped — and how we make it right if anything goes wrong.',
  alternates: { canonical: 'https://stainedglassportraits.com/shipping' },
  robots: { index: true, follow: true },
};

const SECTIONS = [
  {
    h: 'Production time',
    p: 'Your portrait ships within 1–2 weeks after you approve your digital proof. Overall timing depends on how quickly you send your photo and approve the design — most orders are on their way within two to three weeks of purchase.',
  },
  {
    h: 'Shipping',
    p: 'Every piece is printed on real glass, so we pack carefully and ship with tracking. You will receive the tracking number by email when your portrait ships.',
  },
  {
    h: 'Approval before production',
    p: 'Nothing is made until you approve the artwork. We email you a digital proof of your portrait; you approve it or request changes. This is your protection on a custom piece — you always know exactly what you are getting before it exists.',
  },
  {
    h: 'Returns on custom work',
    p: 'Because each portrait is custom-designed from your photo, we cannot restock returns. That is why approval happens before production — and why our guarantee applies instead: if we cannot design something you love, we refund you in full before anything is made.',
  },
  {
    h: 'If it arrives damaged',
    p: 'Glass sometimes loses to the shipping carrier. If your piece arrives damaged, email us a photo of the damage within 7 days and we will make it right.',
  },
];

export default function ShippingPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-8 text-center">
        Shipping &amp; Returns
      </h1>
      <div className="divide-y divide-gray-100">
        {SECTIONS.map(s => (
          <div key={s.h} className="py-5">
            <h2 className="font-semibold text-gray-900 mb-1.5">{s.h}</h2>
            <p className="text-sm text-gray-600 leading-relaxed">{s.p}</p>
          </div>
        ))}
      </div>
      <p className="text-sm text-gray-500 mt-8 text-center">
        Questions before you order? Email{' '}
        <a href="mailto:erin@banwelldesigns.com" className="text-blue-600 hover:underline">
          erin@banwelldesigns.com
        </a>{' '}
        — you will get a real person.
      </p>
      <div className="text-center mt-8">
        <Link
          href="/"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
        >
          Start your portrait
        </Link>
      </div>
    </div>
  );
}
