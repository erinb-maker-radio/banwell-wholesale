import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

// ABOUT — stainedglassportraits.com/about
// Trust page: who makes these, how the process protects the buyer, and the
// plain-English guarantee. Cold traffic needs a reason to trust a $135–$253
// custom purchase from a site they just found — this page is that reason.

export const metadata: Metadata = {
  title: 'About Us — The Couple Behind Your Portrait | Banwell Designs',
  description:
    'Every stained glass style portrait is designed and made by my wife and I in Chico, California — from your photo, with a proof you approve before anything is made.',
  alternates: { canonical: 'https://stainedglassportraits.com/about' },
  openGraph: {
    type: 'website',
    url: 'https://stainedglassportraits.com/about',
    title: 'About Us — The Couple Behind Your Portrait',
    description:
      'Designed and made by my wife and I in Chico, California — from your photo, with a proof you approve before anything is made.',
    siteName: 'Banwell Designs',
  },
};

export default function AboutPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-6 text-center">
        Made by two people, not a factory
      </h1>

      <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-lg mb-8">
        <Image
          src="/images/vet/bulldog-window.jpg"
          alt="A finished stained glass style portrait suncatcher glowing in a customer's window"
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 700px"
        />
      </div>

      <div className="space-y-4 text-gray-600 leading-relaxed">
        <p>
          Hi — this is Erin. Every portrait on this site is designed and made by my wife and I in
          Chico, California. You send us a photo you love; we reimagine it as a stained glass
          style design, print it on real glass, seal it, and hand-finish it. Nothing here is mass
          produced, and nothing is made until you have seen and approved the artwork.
        </p>
        <p>
          We have shipped more than 20,000 orders through our Etsy shops, with a 4.9-star rating
          across 2,600+ five-star reviews. The pieces you see on this site are real customer
          pieces, photographed in their real homes, shown with their real reviews.
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 my-8">
        <h2 className="font-semibold text-gray-900 mb-2">Our guarantee</h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          You approve a digital proof of your portrait before we make anything. We will revise the
          design until it is right — and if we cannot design something you love, we refund you in
          full. You are never stuck with a surprise.
        </p>
      </div>

      <h2 className="text-xl font-semibold text-gray-900 mb-3">How it works</h2>
      <ol className="space-y-2 text-sm text-gray-600 mb-10">
        <li>1. Order your size and send us your favorite photo.</li>
        <li>2. We design your portrait and email you a digital proof.</li>
        <li>3. You approve it (or ask for changes).</li>
        <li>4. We print it on real glass, hand-finish it, and ship it within 1&ndash;2 weeks.</li>
      </ol>

      <div className="text-center">
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
