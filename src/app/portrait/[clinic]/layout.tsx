import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'A Stained Glass Style Portrait of Your Pet — Banwell Designs',
  description: 'Turn your favorite photo of your pet into a handmade stained glass style suncatcher. Designed and made by my wife and I in Chico, California.',
};

// Minimal standalone layout — no wholesale header, no pricing tiers bar,
// no cart. This page is seen by pet owners, not wholesale buyers.
export default function PortraitLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Slim brand header */}
      <header className="border-b border-gray-100 bg-white">
        <div className="max-w-4xl mx-auto px-4 py-3 flex justify-center">
          <Link href="/" aria-label="Banwell Designs home">
            <Image
              src="/images/brand/logos/diamond-logo.png"
              alt="Banwell Designs"
              width={160}
              height={58}
              className="h-auto brightness-0"
              priority
            />
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
