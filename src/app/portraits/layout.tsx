import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  metadataBase: new URL('https://stainedglassportraits.com'),
  title: 'Stained Glass Pet Portraits — Custom Suncatcher From Your Photo | Banwell Designs',
  description:
    'Turn your favorite photo of your pet into a handmade stained glass style suncatcher portrait. Dogs, cats, and memorial pieces. Designed and made by my wife and I in Chico, California.',
  keywords: [
    'stained glass pet portrait',
    'custom pet suncatcher',
    'pet portrait from photo',
    'stained glass style dog portrait',
    'pet memorial suncatcher',
    'custom dog suncatcher',
    'custom cat suncatcher',
  ],
  alternates: { canonical: 'https://stainedglassportraits.com/' },
  openGraph: {
    type: 'website',
    url: 'https://stainedglassportraits.com/',
    title: 'Stained Glass Pet Portraits — Custom Suncatcher From Your Photo',
    description:
      'Turn your favorite photo of your pet into a handmade stained glass style suncatcher portrait. Dogs, cats, and memorial pieces.',
    siteName: 'Banwell Designs',
    images: [{ url: '/images/vet/bulldog-window.jpg', width: 1600, height: 1365, alt: 'Stained glass style dog portrait suncatcher glowing in a window' }],
  },
  robots: { index: true, follow: true },
};

export default function PortraitsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <header className="border-b border-gray-100 bg-white">
        <div className="max-w-4xl mx-auto px-4 py-3 flex justify-center">
          <Link href="/" aria-label="Banwell Designs home" className="text-center">
            <span className="block font-serif text-xl md:text-2xl tracking-wide text-gray-900">
              Banwell Designs
            </span>
            <span className="block text-[11px] uppercase tracking-[0.25em] text-gray-400 mt-0.5">
              Chico, California
            </span>
          </Link>
        </div>
      </header>

      <main>{children}</main>

      <footer className="border-t border-gray-100 mt-16 py-8 text-center text-sm text-gray-400">
        <p>Banwell Designs &mdash; Chico, California</p>
        <p className="mt-1">
          <a href="mailto:erin@banwelldesigns.com" className="hover:text-gray-600 transition-colors">
            erin@banwelldesigns.com
          </a>
          &nbsp;&middot;&nbsp;
          <a
            href="https://www.etsy.com/shop/BanwellDesigns"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-600 transition-colors"
          >
            4.9 stars &middot; 2,600+ five-star reviews on Etsy
          </a>
        </p>
      </footer>
    </div>
  );
}
