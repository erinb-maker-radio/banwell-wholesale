import type { Metadata } from 'next';
import Link from 'next/link';
import Beacon from './Beacon';

// Page-level metadata (title, description, canonical, OG) lives in each
// page.tsx — the hub and every category page own their own SEO surface.
// This layout only sets the shared base + robots policy.
export const metadata: Metadata = {
  metadataBase: new URL('https://stainedglassportraits.com'),
  robots: { index: true, follow: true },
};

const NAV = [
  { href: '/pets', label: 'Pets' },
  { href: '/pet-memorial', label: 'Pet Memorials' },
  { href: '/weddings', label: 'Weddings' },
  { href: '/about', label: 'About' },
];

export default function PortraitsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white text-stone-900">
      <Beacon />
      <header className="border-b border-stone-100 bg-white">
        <div className="max-w-5xl mx-auto px-4 py-4 flex justify-center">
          <Link href="/" aria-label="Banwell Designs home" className="text-center">
            <span className="block font-serif text-xl md:text-2xl tracking-wide text-stone-900">
              Banwell Designs
            </span>
            <span className="block text-[11px] uppercase tracking-[0.25em] text-amber-700/70 mt-0.5">
              Stained Glass Portraits &middot; Chico, California
            </span>
          </Link>
        </div>
        <nav className="max-w-5xl mx-auto px-4 pb-3 flex justify-center gap-6 text-sm">
          {NAV.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="text-stone-500 hover:text-stone-900 transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>

      <main>{children}</main>

      <footer className="border-t border-stone-100 bg-stone-50 py-10 text-center text-sm text-stone-400">
        <p className="font-serif text-base text-stone-600">
          Banwell Designs &mdash; Chico, California
        </p>
        <p className="mt-2">
          <a href="mailto:erin@banwelldesigns.com" className="hover:text-stone-600 transition-colors">
            erin@banwelldesigns.com
          </a>
          &nbsp;&middot;&nbsp;
          <a
            href="https://www.etsy.com/shop/BanwellDesigns"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-stone-600 transition-colors"
          >
            4.9 stars &middot; 2,600+ five-star reviews &middot; 20,000+ sales on Etsy
          </a>
        </p>
        <p className="mt-1">
          <Link href="/about" className="hover:text-stone-600 transition-colors">
            About us
          </Link>
          &nbsp;&middot;&nbsp;
          <Link href="/shipping" className="hover:text-stone-600 transition-colors">
            Shipping &amp; returns
          </Link>
        </p>
      </footer>
    </div>
  );
}
