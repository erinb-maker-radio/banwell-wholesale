import type { Metadata } from 'next';
import Link from 'next/link';

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
];

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
        <nav className="max-w-4xl mx-auto px-4 pb-3 flex justify-center gap-6 text-sm">
          {NAV.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="text-gray-500 hover:text-gray-900 transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>
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
