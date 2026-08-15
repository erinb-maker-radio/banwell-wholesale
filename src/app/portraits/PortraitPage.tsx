import Image from 'next/image';
import Link from 'next/link';
import OrderForm from './OrderForm';
import StickyCTA from './StickyCTA';
import { SIZES } from './data';

// Shared server-rendered layout for every stainedglassportraits.com page
// (hub + category pages). Each page passes its own copy, hero, reviews and
// FAQ; this component renders the sections and the JSON-LD structured data
// so Google can show star ratings and FAQ rich results.
//
// 2026-08-15 redesign — "light through glass":
//  - CTA, price anchor and social proof in the FIRST viewport (the old
//    layout made buyers scroll ~3 screens before they could act)
//  - warm amber/stone palette + serif display type to match the product
//    (glass art, not SaaS); arch-topped hero frame echoes a window
//  - proof-before-payment guarantee promoted from a buried step to its
//    own band — it is the #1 objection-handler for a $200 custom buy
//  - how-it-works moved ABOVE the form so the ask lands after the
//    process is understood; mobile sticky order bar

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

function Stars({ className = 'text-amber-400' }: { className?: string }) {
  return (
    <span aria-hidden="true" className={`${className} tracking-tight`}>
      &#9733;&#9733;&#9733;&#9733;&#9733;
    </span>
  );
}

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
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(props.jsonLd) }}
      />

      {/* ── HERO: message + proof + action in the first viewport ── */}
      <section className="bg-gradient-to-b from-amber-50/70 to-white">
        <div className="max-w-5xl mx-auto px-4 pt-10 pb-12 md:pt-16 md:pb-16 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div className="text-center md:text-left order-2 md:order-1">
            <p className="text-[11px] uppercase tracking-[0.25em] text-amber-700 mb-4">
              Designed &amp; made in Chico, California
            </p>
            <h1 className="font-serif text-4xl md:text-5xl text-stone-900 leading-[1.1] mb-4">
              {props.h1}
            </h1>
            <p className="text-lg text-stone-500 leading-relaxed mb-5 max-w-md mx-auto md:mx-0">
              {props.subhead}
            </p>

            <p className="text-sm text-stone-600 mb-6">
              <Stars /> <span className="font-semibold text-stone-800">4.9</span> &middot; 2,600+
              five-star reviews &middot; 20,000+ sales
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
              <a
                href="#order"
                className="inline-block bg-amber-500 hover:bg-amber-600 text-stone-900 font-semibold py-3.5 px-8 rounded-xl transition-colors shadow-sm"
              >
                Order your portrait &mdash; from ${lowPrice}
              </a>
              <a
                href="#how"
                className="inline-block text-stone-600 hover:text-stone-900 font-medium py-3.5 px-6 rounded-xl border border-stone-200 hover:border-stone-300 transition-colors"
              >
                How it works
              </a>
            </div>
            <p className="text-xs text-stone-400 mt-4">
              You approve the artwork before we make anything.
            </p>
          </div>

          {/* Arch-topped frame — the shape of a stained glass window */}
          <div className="order-1 md:order-2">
            <div className="relative w-full max-w-sm mx-auto aspect-[4/5] rounded-t-[10rem] rounded-b-2xl overflow-hidden shadow-xl ring-1 ring-stone-900/10">
              <Image
                src={props.heroImage}
                alt={props.heroAlt}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, 420px"
              />
            </div>
            <p className="text-center text-xs text-stone-400 mt-3">
              A real customer&apos;s portrait, hanging in her window
            </p>
          </div>
        </div>
      </section>

      {/* ── TRUST BAND ── */}
      <section className="border-y border-stone-100 bg-white">
        <div className="max-w-5xl mx-auto px-4 py-5 grid grid-cols-1 sm:grid-cols-3 gap-3 text-center text-sm text-stone-600">
          <p>
            <span className="font-semibold text-stone-900">Free digital proof</span> &mdash;
            approve it before we print
          </p>
          <p>
            <span className="font-semibold text-stone-900">Printed on real glass</span> &mdash;
            sealed &amp; hand-finished
          </p>
          <p>
            <span className="font-semibold text-stone-900">Ships in 1&ndash;2 weeks</span> after
            approval, with tracking
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4">
        {/* ── CATEGORY TILES (hub only) ── */}
        {props.tiles && (
          <section className="pt-12 pb-2">
            <h2 className="font-serif text-3xl text-stone-900 text-center mb-2">
              What will you keep in the light?
            </h2>
            <p className="text-stone-500 text-center mb-8">
              Every portrait starts with a photo you love.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {props.tiles.map(tile => (
                <Link
                  key={tile.href}
                  href={tile.href}
                  className="group block bg-white rounded-2xl overflow-hidden border border-stone-100 hover:border-amber-200 hover:shadow-lg transition-all"
                >
                  <div className="relative w-full aspect-square overflow-hidden">
                    <Image
                      src={tile.photo}
                      alt={tile.alt}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, 320px"
                    />
                  </div>
                  <div className="p-5">
                    <p className="font-serif text-lg text-stone-900 group-hover:text-amber-700 transition-colors">
                      {tile.title} &rarr;
                    </p>
                    <p className="text-sm text-stone-500 mt-1 leading-relaxed">{tile.blurb}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ── HOW IT WORKS — before the ask ── */}
        <section id="how" className="pt-14 pb-4 scroll-mt-6">
          <h2 className="font-serif text-3xl text-stone-900 text-center mb-2">How it works</h2>
          <p className="text-stone-500 text-center mb-10">
            From your photo to your window in four steps.
          </p>
          <ol className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {props.steps.map(step => (
              <li
                key={step.step}
                className={`rounded-2xl p-5 border ${
                  step.step === '3'
                    ? 'border-amber-300 bg-amber-50/60'
                    : 'border-stone-100 bg-white'
                }`}
              >
                <span
                  className={`inline-flex w-9 h-9 rounded-full text-sm font-bold items-center justify-center mb-3 ${
                    step.step === '3'
                      ? 'bg-amber-500 text-stone-900'
                      : 'bg-stone-900 text-white'
                  }`}
                >
                  {step.step}
                </span>
                <p className="font-semibold text-stone-900 mb-1">{step.title}</p>
                <p className="text-sm text-stone-500 leading-relaxed">{step.body}</p>
                {step.step === '3' && (
                  <p className="text-xs font-medium text-amber-700 mt-2">
                    Nothing is made until you say so.
                  </p>
                )}
              </li>
            ))}
          </ol>
        </section>

        {/* ── ORDER ── */}
        <section id="order" className="pt-14 pb-16 scroll-mt-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 md:gap-10 items-start">
            <div className="md:col-span-3 bg-white rounded-2xl border border-stone-200 shadow-sm p-6 md:p-8">
              <OrderForm />
            </div>

            <aside className="md:col-span-2 md:sticky md:top-6 space-y-5">
              <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-6">
                <p className="font-serif text-xl text-stone-900 mb-2">
                  See it before we make it
                </p>
                <p className="text-sm text-stone-600 leading-relaxed">
                  After you order, we design your portrait and email you a digital proof. We
                  don&apos;t print anything until you love it &mdash; revisions included.
                </p>
              </div>

              <div className="rounded-2xl border border-stone-100 bg-white p-6">
                <p className="text-sm text-stone-600 leading-relaxed">
                  Traditional stained glass commissions run{' '}
                  <span className="font-semibold text-stone-900">$500&ndash;$2,000+</span> and
                  take months. A portrait printed on real glass starts at{' '}
                  <span className="font-semibold text-stone-900">${lowPrice}</span> and ships in
                  1&ndash;2 weeks.
                </p>
              </div>

              {props.reviews[0] && (
                <div className="rounded-2xl border border-stone-100 bg-white p-6">
                  <Stars className="text-amber-400 text-sm" />
                  <p className="text-sm text-stone-700 leading-relaxed italic mt-2 mb-2">
                    &ldquo;{props.reviews[0].quote}&rdquo;
                  </p>
                  <p className="text-xs text-stone-500 font-medium">
                    {props.reviews[0].author} &middot; {props.reviews[0].meta}
                  </p>
                </div>
              )}
            </aside>
          </div>
        </section>
      </div>

      {/* ── SOCIAL PROOF + REVIEWS ── */}
      <section className="bg-stone-50 border-y border-stone-100">
        <div className="max-w-5xl mx-auto px-4 py-14">
          <p className="text-center mb-1">
            <Stars className="text-amber-400 text-xl" />
          </p>
          <h2 className="font-serif text-3xl text-stone-900 text-center mb-2">
            4.9 from 2,600+ five-star reviews
          </h2>
          <p className="text-stone-500 text-sm text-center max-w-lg mx-auto mb-10">
            20,000+ pieces designed and made by my wife and I in Chico, California. Printed on
            real glass and hand-finished &mdash; not mass produced.
          </p>
          <div className={`grid grid-cols-1 ${reviewGrid} gap-5`}>
            {props.reviews.map(review => (
              <figure
                key={review.author}
                className="bg-white rounded-2xl border border-stone-100 p-5 shadow-sm"
              >
                <div className="relative w-full aspect-square rounded-xl overflow-hidden mb-4">
                  <Image
                    src={review.photo}
                    alt={`Customer photo from ${review.author}'s order`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 320px"
                  />
                </div>
                <Stars className="text-amber-400 text-sm" />
                <blockquote className="text-stone-700 text-sm leading-relaxed italic mt-2 mb-3">
                  &ldquo;{review.quote}&rdquo;
                </blockquote>
                <figcaption>
                  <p className="text-xs text-stone-600 font-semibold">{review.author}</p>
                  <p className="text-[11px] text-stone-400 mt-0.5">{review.meta}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4">
        {props.hubLink && (
          <p className="text-center text-sm text-stone-500 pt-10">
            Looking for something else?{' '}
            <Link href="/" className="text-amber-700 hover:text-amber-800 font-medium">
              See everything we make portraits of
            </Link>
          </p>
        )}

        {/* ── FAQ (visible content — SEO + FAQPage schema) ── */}
        <section className="pt-12 pb-8">
          <h2 className="font-serif text-3xl text-stone-900 mb-8 text-center">
            Frequently asked questions
          </h2>
          <div className="max-w-2xl mx-auto divide-y divide-stone-100">
            {props.faq.map(item => (
              <div key={item.q} className="py-5">
                <h3 className="font-semibold text-stone-900 mb-1.5">{item.q}</h3>
                <p className="text-sm text-stone-600 leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── FINAL CTA ── */}
        <section className="pb-20 text-center">
          <div className="rounded-3xl bg-gradient-to-b from-amber-50 to-white border border-amber-100 px-6 py-12">
            <h2 className="font-serif text-3xl text-stone-900 mb-3">
              A photo you love, kept in the light
            </h2>
            <p className="text-stone-500 mb-6 max-w-md mx-auto">
              From ${lowPrice} &middot; free proof to approve &middot; ships in 1&ndash;2 weeks
            </p>
            <a
              href="#order"
              className="inline-block bg-amber-500 hover:bg-amber-600 text-stone-900 font-semibold py-3.5 px-10 rounded-xl transition-colors shadow-sm"
            >
              Order your portrait
            </a>
          </div>
        </section>
      </div>

      <StickyCTA fromPrice={lowPrice} />
    </div>
  );
}
