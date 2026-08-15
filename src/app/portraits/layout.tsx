import type { Metadata } from 'next';
import Link from 'next/link';
import { Fraunces } from 'next/font/google';
import Beacon from './Beacon';

// Page-level metadata (title, description, canonical, OG) lives in each
// page.tsx — the hub and every category page own their own SEO surface.
// This layout only sets the shared base + robots policy.
//
// Brand identity: "Kept in the Light" — cathedral glass. Midnight indigo,
// parchment ivory, gilded gold; Fraunces display serif. Full spec in the
// marketing repo's BRAND.md.
export const metadata: Metadata = {
  metadataBase: new URL('https://stainedglassportraits.com'),
  robots: { index: true, follow: true },
};

const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-fraunces',
  display: 'swap',
});

const NAV = [
  { href: '/pets', label: 'Pets' },
  { href: '/pet-memorial', label: 'Pet Memorials' },
  { href: '/weddings', label: 'Weddings' },
  { href: '/about', label: 'About' },
];

export default function PortraitsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`${fraunces.variable} min-h-screen bg-[#faf7f1] text-[#232946]`}
      style={{ colorScheme: 'light' }}
    >
      <Beacon />
      {/* Double leadline under the header: 2px midnight over 1px gold */}
      <header className="bg-[#faf7f1] border-b-2 border-[#232946] shadow-[0_1px_0_#d4a33d,0_2px_0_#d4a33d]">
        <div className="max-w-5xl mx-auto px-4 py-4 flex justify-center">
          <Link href="/" aria-label="Banwell Designs home" className="text-center">
            <span className="block font-display text-2xl md:text-3xl tracking-wide text-[#232946]">
              Banwell Designs
            </span>
            <span className="block text-[11px] uppercase tracking-[0.3em] text-[#a8823a] mt-1">
              Stained Glass Portraits &middot; Chico, California
            </span>
          </Link>
        </div>
        <nav className="max-w-5xl mx-auto px-4 pb-3 flex justify-center gap-6 text-sm">
          {NAV.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="text-[#232946]/60 hover:text-[#232946] transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>

      <main>{children}</main>

      <footer className="bg-[#232946] py-12 text-center text-sm text-[#f5f1e6]/60">
        <p aria-hidden="true" className="text-[#d4a33d] text-xs tracking-[0.5em] mb-4">
          &#9670;&nbsp;&#9670;&nbsp;&#9670;
        </p>
        <p className="font-display text-lg text-[#f5f1e6]">
          Banwell Designs &mdash; Chico, California
        </p>
        <p className="mt-1 italic font-display text-[#f5f1e6]/70">
          A photo you love, kept in the light.
        </p>
        <p className="mt-4">
          <a href="mailto:erin@banwelldesigns.com" className="hover:text-[#f5f1e6] transition-colors">
            erin@banwelldesigns.com
          </a>
          &nbsp;&middot;&nbsp;
          <a
            href="https://www.etsy.com/shop/BanwellDesigns"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#f5f1e6] transition-colors"
          >
            4.9 stars &middot; 2,600+ five-star reviews &middot; 20,000+ sales on Etsy
          </a>
        </p>
        <p className="mt-1">
          <Link href="/about" className="hover:text-[#f5f1e6] transition-colors">
            About us
          </Link>
          &nbsp;&middot;&nbsp;
          <Link href="/shipping" className="hover:text-[#f5f1e6] transition-colors">
            Shipping &amp; returns
          </Link>
        </p>
      </footer>
    </div>
  );
}
