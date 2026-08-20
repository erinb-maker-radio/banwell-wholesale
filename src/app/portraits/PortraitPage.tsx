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
// Brand identity (2026-08-15): "Kept in the Light" — cathedral glass.
// Research-backed: the core buyer is a woman 35–54 buying a memorial or
// commemorative piece; a keepsake is a grief-processing ritual object, and
// stained glass is the art form of TRANSMITTED light (churches, reverence,
// permanence). So glass glows out of midnight indigo the way a window glows
// in a dark nave; gold is the light; parchment is the page. Full spec in
// the marketing repo's BRAND.md.
//
// Palette: midnight #232946 · parchment #faf7f1 · ivory #f5f1e6 ·
// gold #d4a33d (hover #c2922f) · jewel accents ruby/cobalt/emerald
// used only in diamond separators.

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

export type CaseStudy = {
  eyebrow: string;
  title: React.ReactNode;
  intro: string;
  beforeImage: string;
  beforeAlt: string;
  afterImage: string;
  afterAlt: string;
  makerImage: string;
  makerAlt: string;
  quote: string;
  attribution: string;
};

function Stars({ className = 'text-[#d4a33d]' }: { className?: string }) {
  return (
    <span aria-hidden="true" className={`${className} tracking-tight`}>
      &#9733;&#9733;&#9733;&#9733;&#9733;
    </span>
  );
}

/** Jewel-tone diamond separator — ruby, gold, cobalt. */
function Diamonds() {
  return (
    <p aria-hidden="true" className="text-center text-xs tracking-[0.6em] mb-3">
      <span className="text-[#a33b4d]">&#9670;</span>
      <span className="text-[#d4a33d]">&#9670;</span>
      <span className="text-[#3b5ba5]">&#9670;</span>
    </p>
  );
}

export default function PortraitPage(props: {
  h1: React.ReactNode;
  subhead: string;
  heroImage: string;
  heroAlt: string;
  /** Optional second finished-piece image shown beneath the hero. */
  secondaryImage?: string;
  secondaryAlt?: string;
  /** Caption under the secondary image (falls back to a generic line). */
  secondaryCaption?: string;
  steps: Step[];
  reviews: Review[];
  faq: FaqItem[];
  jsonLd: object;
  /** Optional category tile grid (hub page) rendered under the hero. */
  tiles?: CategoryTile[];
  /** Optional real-customer case study, rendered under the trust band. */
  caseStudy?: CaseStudy;
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

      {/* ── HERO: glass glowing out of the dark — message + proof + action ── */}
      <section className="relative bg-[#232946] overflow-hidden">
        {/* candle-gold glow rising behind the window */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 55% 65% at 72% 45%, rgba(212,163,61,0.28), rgba(212,163,61,0.07) 55%, transparent 75%)',
          }}
        />
        <div className="relative max-w-5xl mx-auto px-4 pt-12 pb-14 md:pt-16 md:pb-16 grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-12 items-center">
          <div className="text-center md:text-left order-2 md:order-1">
            <p className="text-[11px] uppercase tracking-[0.3em] text-[#d4a33d] mb-4">
              Designed &amp; made in Chico, California
            </p>
            <h1 className="font-display text-4xl md:text-[3.4rem] text-[#f5f1e6] leading-[1.08] mb-4">
              {props.h1}
            </h1>
            <p className="text-lg text-[#f5f1e6]/70 leading-relaxed mb-5 max-w-md mx-auto md:mx-0">
              {props.subhead}
            </p>

            <p className="text-sm text-[#f5f1e6]/80 mb-7">
              <Stars /> <span className="font-semibold text-[#f5f1e6]">4.9</span> &middot; 2,600+
              five-star reviews &middot; 20,000+ sales
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
              <a
                href="#order"
                className="inline-block bg-[#d4a33d] hover:bg-[#c2922f] text-[#232946] font-semibold py-3.5 px-8 rounded-lg transition-colors shadow-[0_0_24px_rgba(212,163,61,0.35)]"
              >
                Order your portrait &mdash; from ${lowPrice}
              </a>
              <a
                href="#how"
                className="inline-block text-[#f5f1e6]/80 hover:text-[#f5f1e6] font-medium py-3.5 px-6 rounded-lg border border-[#f5f1e6]/25 hover:border-[#f5f1e6]/50 transition-colors"
              >
                How it works
              </a>
            </div>
            <p className="text-xs text-[#f5f1e6]/50 mt-4">
              You approve the artwork before we make anything.
            </p>
          </div>

          {/* Arch-topped frame — a window glowing in the nave */}
          <div className="order-1 md:order-2">
            <div className="relative w-full max-w-sm mx-auto aspect-[4/5] rounded-t-[10rem] rounded-b-xl overflow-hidden ring-4 ring-[#d4a33d]/70 shadow-[0_0_60px_rgba(212,163,61,0.35)]">
              <Image
                src={props.heroImage}
                alt={props.heroAlt}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, 420px"
              />
            </div>
            <p className="text-center text-xs text-[#f5f1e6]/50 mt-4 italic font-display">
              A real customer&apos;s portrait, hanging in her window
            </p>

            {props.secondaryImage && (
              <div className="mt-6 max-w-sm mx-auto">
                <div className="relative w-full aspect-square rounded-xl overflow-hidden ring-2 ring-[#d4a33d]/50 shadow-[0_0_40px_rgba(212,163,61,0.22)]">
                  <Image
                    src={props.secondaryImage}
                    alt={props.secondaryAlt || props.heroAlt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 420px"
                  />
                </div>
                <p className="text-center text-xs text-[#f5f1e6]/50 mt-3 italic font-display">
                  {props.secondaryCaption || 'Another portrait, kept in the light'}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── TRUST BAND ── */}
      <section className="bg-[#f3ecdb] border-b border-[#232946]/10">
        <div className="max-w-5xl mx-auto px-4 py-5 grid grid-cols-1 sm:grid-cols-3 gap-3 text-center text-sm text-[#232946]/75">
          <p>
            <span className="font-semibold text-[#232946]">Free digital proof</span> &mdash;
            approve it before we print
          </p>
          <p>
            <span className="font-semibold text-[#232946]">Printed on real glass</span> &mdash;
            sealed &amp; hand-finished
          </p>
          <p>
            <span className="font-semibold text-[#232946]">Ships in 1&ndash;2 weeks</span> after
            approval, with tracking
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4">
        {/* ── CASE STUDY (real customer story) ── */}
        {props.caseStudy && (
          <section className="pt-16 pb-2">
            <Diamonds />
            <p className="text-[11px] uppercase tracking-[0.3em] text-[#a8823a] text-center mb-3">
              {props.caseStudy.eyebrow}
            </p>
            <h2 className="font-display text-3xl md:text-4xl text-[#232946] text-center mb-4">
              {props.caseStudy.title}
            </h2>
            <p className="text-[#232946]/65 text-center max-w-2xl mx-auto mb-10 leading-relaxed">
              {props.caseStudy.intro}
            </p>

            {/* Before / after — the photo she sent, and the piece in the window */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-6 max-w-3xl mx-auto mb-10 items-start">
              <figure className="text-center">
                <div className="relative w-full aspect-square rounded-xl overflow-hidden ring-1 ring-[#232946]/15 bg-white">
                  <Image
                    src={props.caseStudy.beforeImage}
                    alt={props.caseStudy.beforeAlt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 360px"
                  />
                </div>
                <figcaption className="text-[11px] uppercase tracking-[0.2em] text-[#232946]/50 mt-3">
                  The photo she sent
                </figcaption>
              </figure>
              <figure className="text-center">
                <div className="relative w-full aspect-square rounded-xl overflow-hidden ring-2 ring-[#d4a33d]/70 shadow-[0_0_40px_rgba(212,163,61,0.25)]">
                  <Image
                    src={props.caseStudy.afterImage}
                    alt={props.caseStudy.afterAlt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 360px"
                  />
                </div>
                <figcaption className="text-[11px] uppercase tracking-[0.2em] text-[#a8823a] mt-3">
                  Kept in the light
                </figcaption>
              </figure>
            </div>

            {/* His message, beside a photo of him holding the finished piece */}
            <div className="grid grid-cols-1 md:grid-cols-2 max-w-3xl mx-auto rounded-2xl overflow-hidden bg-[#232946] items-stretch">
              <div className="relative min-h-[320px] md:min-h-full aspect-[3/4] md:aspect-auto">
                <Image
                  src={props.caseStudy.makerImage}
                  alt={props.caseStudy.makerAlt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 360px"
                />
              </div>
              <div className="p-7 md:p-9 flex flex-col justify-center">
                <Stars className="text-[#d4a33d] text-sm" />
                <blockquote className="font-display text-xl md:text-2xl text-[#f5f1e6] leading-snug italic mt-3 mb-4">
                  &ldquo;{props.caseStudy.quote}&rdquo;
                </blockquote>
                <p className="text-xs text-[#f5f1e6]/60">{props.caseStudy.attribution}</p>
              </div>
            </div>
          </section>
        )}

        {/* ── CATEGORY TILES (hub only) ── */}
        {props.tiles && (
          <section className="pt-14 pb-2">
            <Diamonds />
            <h2 className="font-display text-3xl md:text-4xl text-[#232946] text-center mb-2">
              What will you keep in the light?
            </h2>
            <p className="text-[#232946]/60 text-center mb-9">
              Every portrait starts with a photo you love.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {props.tiles.map(tile => (
                <Link
                  key={tile.href}
                  href={tile.href}
                  className="group block bg-white rounded-xl overflow-hidden border border-[#232946]/15 hover:border-[#d4a33d] hover:shadow-[0_8px_30px_rgba(35,41,70,0.12)] transition-all"
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
                    <p className="font-display text-xl text-[#232946] group-hover:text-[#a8823a] transition-colors">
                      {tile.title} &rarr;
                    </p>
                    <p className="text-sm text-[#232946]/60 mt-1 leading-relaxed">{tile.blurb}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ── HOW IT WORKS — before the ask ── */}
        <section id="how" className="pt-16 pb-4 scroll-mt-6">
          <Diamonds />
          <h2 className="font-display text-3xl md:text-4xl text-[#232946] text-center mb-2">
            How it works
          </h2>
          <p className="text-[#232946]/60 text-center mb-10">
            From your photo to your window in four steps.
          </p>
          <ol className="grid grid-cols-1 md:grid-cols-4 gap-5">
            {props.steps.map(step => (
              <li
                key={step.step}
                className={`rounded-xl p-5 border ${
                  step.step === '3'
                    ? 'border-[#d4a33d] bg-[#f3ecdb] shadow-[0_0_20px_rgba(212,163,61,0.18)]'
                    : 'border-[#232946]/15 bg-white'
                }`}
              >
                <span
                  className={`inline-flex w-9 h-9 rounded-full text-sm font-bold items-center justify-center mb-3 ${
                    step.step === '3'
                      ? 'bg-[#d4a33d] text-[#232946]'
                      : 'bg-[#232946] text-[#f5f1e6]'
                  }`}
                >
                  {step.step}
                </span>
                <p className="font-semibold text-[#232946] mb-1">{step.title}</p>
                <p className="text-sm text-[#232946]/60 leading-relaxed">{step.body}</p>
                {step.step === '3' && (
                  <p className="text-xs font-semibold text-[#a8823a] mt-2">
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
            <div className="md:col-span-3 bg-white rounded-xl border-2 border-[#232946]/20 shadow-[0_8px_30px_rgba(35,41,70,0.08)] p-6 md:p-8">
              <OrderForm />
            </div>

            <aside className="md:col-span-2 md:sticky md:top-6 space-y-5">
              <div className="rounded-xl border border-[#d4a33d] bg-[#f3ecdb] p-6">
                <p className="font-display text-2xl text-[#232946] mb-2">
                  See it before we make it
                </p>
                <p className="text-sm text-[#232946]/70 leading-relaxed">
                  After you order, we design your portrait and email you a digital proof. We
                  don&apos;t print anything until you love it &mdash; revisions included.
                </p>
              </div>

              <div className="rounded-xl border border-[#232946]/15 bg-white p-6">
                <p className="text-sm text-[#232946]/70 leading-relaxed">
                  Traditional stained glass commissions run{' '}
                  <span className="font-semibold text-[#232946]">$500&ndash;$2,000+</span> and
                  take months. A portrait printed on real glass starts at{' '}
                  <span className="font-semibold text-[#232946]">${lowPrice}</span> and ships in
                  1&ndash;2 weeks.
                </p>
              </div>

              {props.reviews[0] && (
                <div className="rounded-xl border border-[#232946]/15 bg-white p-6">
                  <Stars className="text-[#d4a33d] text-sm" />
                  <p className="text-sm text-[#232946]/80 leading-relaxed italic font-display mt-2 mb-2 text-base">
                    &ldquo;{props.reviews[0].quote}&rdquo;
                  </p>
                  <p className="text-xs text-[#232946]/60 font-medium">
                    {props.reviews[0].author} &middot; {props.reviews[0].meta}
                  </p>
                </div>
              )}
            </aside>
          </div>
        </section>
      </div>

      {/* ── SOCIAL PROOF + REVIEWS — back into the nave ── */}
      <section className="relative bg-[#232946] overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(212,163,61,0.16), transparent 70%)',
          }}
        />
        <div className="relative max-w-5xl mx-auto px-4 py-16">
          <p className="text-center mb-2">
            <Stars className="text-[#d4a33d] text-xl" />
          </p>
          <h2 className="font-display text-3xl md:text-4xl text-[#f5f1e6] text-center mb-2">
            4.9 from 2,600+ five-star reviews
          </h2>
          <p className="text-[#f5f1e6]/60 text-sm text-center max-w-lg mx-auto mb-11">
            20,000+ pieces designed and made by my wife and I in Chico, California. Printed on
            real glass and hand-finished &mdash; not mass produced.
          </p>
          <div className={`grid grid-cols-1 ${reviewGrid} gap-5`}>
            {props.reviews.map(review => (
              <figure
                key={review.author}
                className="bg-[#faf7f1] rounded-xl p-5 ring-1 ring-[#d4a33d]/30"
              >
                <div className="relative w-full aspect-square rounded-lg overflow-hidden mb-4">
                  <Image
                    src={review.photo}
                    alt={`Customer photo from ${review.author}'s order`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 320px"
                  />
                </div>
                <Stars className="text-[#d4a33d] text-sm" />
                <blockquote className="text-[#232946]/85 text-sm leading-relaxed italic font-display mt-2 mb-3 text-base">
                  &ldquo;{review.quote}&rdquo;
                </blockquote>
                <figcaption>
                  <p className="text-xs text-[#232946] font-semibold">{review.author}</p>
                  <p className="text-[11px] text-[#232946]/50 mt-0.5">{review.meta}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4">
        {props.hubLink && (
          <p className="text-center text-sm text-[#232946]/60 pt-10">
            Looking for something else?{' '}
            <Link href="/" className="text-[#a8823a] hover:text-[#8a6a2c] font-medium">
              See everything we make portraits of
            </Link>
          </p>
        )}

        {/* ── FAQ (visible content — SEO + FAQPage schema) ── */}
        <section className="pt-14 pb-8">
          <Diamonds />
          <h2 className="font-display text-3xl md:text-4xl text-[#232946] mb-8 text-center">
            Frequently asked questions
          </h2>
          <div className="max-w-2xl mx-auto divide-y divide-[#232946]/10">
            {props.faq.map(item => (
              <div key={item.q} className="py-5">
                <h3 className="font-semibold text-[#232946] mb-1.5">{item.q}</h3>
                <p className="text-sm text-[#232946]/65 leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── FINAL CTA — one last window in the dark ── */}
        <section className="pb-20 text-center">
          <div
            className="relative rounded-2xl bg-[#232946] px-6 py-14 overflow-hidden"
          >
            <div
              aria-hidden="true"
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  'radial-gradient(ellipse 50% 70% at 50% 100%, rgba(212,163,61,0.22), transparent 70%)',
              }}
            />
            <div className="relative">
              <p aria-hidden="true" className="text-xs tracking-[0.6em] mb-4">
                <span className="text-[#a33b4d]">&#9670;</span>
                <span className="text-[#d4a33d]">&#9670;</span>
                <span className="text-[#3b5ba5]">&#9670;</span>
              </p>
              <h2 className="font-display text-3xl md:text-4xl text-[#f5f1e6] mb-3">
                A photo you love, kept in the light
              </h2>
              <p className="text-[#f5f1e6]/60 mb-7 max-w-md mx-auto">
                From ${lowPrice} &middot; free proof to approve &middot; ships in 1&ndash;2 weeks
              </p>
              <a
                href="#order"
                className="inline-block bg-[#d4a33d] hover:bg-[#c2922f] text-[#232946] font-semibold py-3.5 px-10 rounded-lg transition-colors shadow-[0_0_24px_rgba(212,163,61,0.35)]"
              >
                Order your portrait
              </a>
            </div>
          </div>
        </section>
      </div>

      <StickyCTA fromPrice={lowPrice} />
    </div>
  );
}
