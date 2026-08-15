import Image from 'next/image';
import Link from 'next/link';
import OrderForm from './OrderForm';
import { SIZES } from './data';

// Shared server-rendered layout for every stainedglassportraits.com page
// (hub + category pages). Each page passes its own copy, hero, reviews and
// FAQ; this component renders the sections and the JSON-LD structured data
// so Google can show star ratings and FAQ rich results.

type Review = { quote: string; author: string; meta: string; photo: string };
type FaqItem = { q: string; a: string };
type Step = { step: string; title: string; body: string };

const lowPrice = Math.min(...SIZES.map(s => s.price));
const highPrice = Math.max(...SIZES.map(s => s.price));

export function buildJsonLd(opts: {
  productName: string;
  productDescription: string;
  image: string;
  url: string;
  reviews: Review[];
  faq: FaqItem[];
}) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Product',
        name: opts.productName,
        description: opts.productDescription,
        brand: { '@type': 'Brand', name: 'Banwell Designs' },
        image: `https://stainedglassportraits.com${opts.image}`,
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
          url: opts.url,
        },
        review: opts.reviews.map(r => ({
          '@type': 'Review',
          reviewRating: { '@type': 'Rating', ratingValue: '5' },
          author: { '@type': 'Person', name: r.author },
          reviewBody: r.quote,
        })),
      },
      {
        '@type': 'FAQPage',
        mainEntity: opts.faq.map(f => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      },
    ],
  };
}

export type CategoryTile = {
  href: string;
  title: string;
  blurb: string;
  photo: string;
  alt: string;
};

export default function PortraitPage(props: {
  h1: React.ReactNode;
  subhead: string;
  heroImage: string;
  heroAlt: string;
  steps: Step[];
  reviews: Review[];
  faq: FaqItem[];
  jsonLd: object;
  /** Optional category tile grid (hub page) rendered under the hero. */
  tiles?: CategoryTile[];
  /** Optional link back to the hub, shown above the FAQ. */
  hubLink?: boolean;
}) {
  const reviewGrid =
    props.reviews.length >= 3
      ? 'md:grid-cols-3'
      : props.reviews.length === 2
        ? 'md:grid-cols-2 max-w-2xl mx-auto'
        : 'max-w-md mx-auto';

  return (
    <div className="max-w-4xl mx-auto px-4">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(props.jsonLd) }}
      />

      {/* ── HERO ── */}
      <section className="pt-10 pb-8 text-center">
        <h1 className="text-3xl md:text-5xl font-semibold text-gray-900 leading-tight mb-4">
          {props.h1}
        </h1>
        <p className="text-lg text-gray-500 max-w-xl mx-auto leading-relaxed">{props.subhead}</p>
      </section>

      {/* ── HERO IMAGE ── */}
      <section className="mb-10">
        <div className="relative w-full aspect-[4/3] md:aspect-[16/9] rounded-2xl overflow-hidden shadow-lg">
          <Image
            src={props.heroImage}
            alt={props.heroAlt}
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

      {/* ── CATEGORY TILES (hub only) ── */}
      {props.tiles && (
        <section className="mb-14">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {props.tiles.map(tile => (
              <Link
                key={tile.href}
                href={tile.href}
                className="group block bg-gray-50 rounded-xl overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="relative w-full aspect-square overflow-hidden">
                  <Image
                    src={tile.photo}
                    alt={tile.alt}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, 300px"
                  />
                </div>
                <div className="p-4">
                  <p className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                    {tile.title} &rarr;
                  </p>
                  <p className="text-sm text-gray-500 mt-1 leading-relaxed">{tile.blurb}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── ORDER FORM + HOW IT WORKS ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-16">
        <OrderForm />

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">How it works</h2>
          <ol className="space-y-6">
            {props.steps.map(step => (
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
        <p className="text-2xl font-semibold text-gray-900 mb-2">
          4.9 stars &middot; 2,600+ five-star reviews &middot; 20,000+ sales
        </p>
        <p className="text-gray-500 text-sm max-w-lg mx-auto">
          Designed and made in Chico, California. Each piece is printed on real glass and
          hand-finished. Not mass produced.
        </p>
      </section>

      {/* ── REVIEWS ── */}
      <section className={`grid grid-cols-1 ${reviewGrid} gap-4 pb-12`}>
        {props.reviews.map(review => (
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
            <p className="text-gray-700 text-sm leading-relaxed italic mb-3">
              &ldquo;{review.quote}&rdquo;
            </p>
            <p className="text-xs text-gray-500 font-medium">{review.author}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">{review.meta}</p>
          </div>
        ))}
      </section>

      {props.hubLink && (
        <p className="text-center text-sm text-gray-500 pb-8">
          Looking for something else?{' '}
          <Link href="/" className="text-blue-600 hover:text-blue-700 font-medium">
            See everything we make portraits of
          </Link>
        </p>
      )}

      {/* ── FAQ (visible content — SEO + FAQPage schema) ── */}
      <section className="border-t border-gray-100 pt-10 pb-16">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
          Frequently asked questions
        </h2>
        <div className="max-w-2xl mx-auto divide-y divide-gray-100">
          {props.faq.map(item => (
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
