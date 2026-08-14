import Image from 'next/image';
import OrderForm from './OrderForm';
import { HOW_IT_WORKS, REVIEWS, FAQ, SIZES } from './data';

// Server-rendered general (direct-to-consumer) stained glass pet portrait page.
// Served at stainedglassportraits.com/ via a host-based rewrite in middleware.
// This is the SEO surface: real text content + JSON-LD structured data so
// Google can show star ratings and FAQ rich results.

const lowPrice = Math.min(...SIZES.map(s => s.price));
const highPrice = Math.max(...SIZES.map(s => s.price));

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Product',
      name: 'Custom Stained Glass Style Pet Portrait Suncatcher',
      description:
        'A handmade stained glass style portrait of your pet, made from your favorite photo and printed on real glass. Designed and made in Chico, California.',
      brand: { '@type': 'Brand', name: 'Banwell Designs' },
      image: 'https://stainedglassportraits.com/images/vet/bulldog-window.jpg',
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.9',
        reviewCount: '2600',
      },
      offers: {
        '@type': 'AggregateOffer',
        priceCurrency: 'USD',
        lowPrice: String(lowPrice),
        highPrice: String(highPrice),
        availability: 'https://schema.org/InStock',
        url: 'https://stainedglassportraits.com/',
      },
      review: REVIEWS.map(r => ({
        '@type': 'Review',
        reviewRating: { '@type': 'Rating', ratingValue: '5' },
        author: { '@type': 'Person', name: r.author },
        reviewBody: r.quote,
      })),
    },
    {
      '@type': 'FAQPage',
      mainEntity: FAQ.map(f => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    },
  ],
};

export default function GeneralPortraitPage() {
  return (
    <div className="max-w-4xl mx-auto px-4">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

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

      {/* ── ORDER FORM + HOW IT WORKS ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-16">
        <OrderForm />

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

      {/* ── REVIEWS ── */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-12">
        {REVIEWS.map(review => (
          <div key={review.author} className="bg-gray-50 rounded-xl p-5">
            <div className="text-yellow-400 text-sm mb-2">&#9733;&#9733;&#9733;&#9733;&#9733;</div>
            <div className="relative w-full aspect-square rounded-lg overflow-hidden mb-3">
              <Image
                src={review.photo}
                alt={`Customer photo from ${review.author}'s order`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 300px"
              />
            </div>
            <p className="text-gray-700 text-sm leading-relaxed italic mb-3">&ldquo;{review.quote}&rdquo;</p>
            <p className="text-xs text-gray-500 font-medium">{review.author}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">{review.meta}</p>
          </div>
        ))}
      </section>

      {/* ── FAQ (visible content — SEO + FAQPage schema) ── */}
      <section className="border-t border-gray-100 pt-10 pb-16">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">Frequently asked questions</h2>
        <div className="max-w-2xl mx-auto divide-y divide-gray-100">
          {FAQ.map(item => (
            <div key={item.q} className="py-5">
              <h3 className="font-semibold text-gray-900 mb-1.5">{item.q}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
