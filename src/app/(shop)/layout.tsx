'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Footer from '@/components/layout/Footer';

const etsyUrl = 'https://www.etsy.com/shop/BanwellDesigns';

const shopCategories = [
  { label: 'Leather', href: `${etsyUrl}?search_query=leather` },
  { label: 'Art Glass', href: etsyUrl },
  { label: 'Paper Art', href: etsyUrl },
];

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [shopDropdownOpen, setShopDropdownOpen] = useState(false);
  const [mobileShopOpen, setMobileShopOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShopDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Only leather gets the dark theme
  const isDark = pathname.startsWith('/leather');
  const isPaper = pathname.startsWith('/paper');
  const isLanding = pathname === '/';
  const showFullLogo = isDark;

  const headerBg = isDark ? 'bg-black' : isPaper ? 'bg-[#F5E6D0]' : 'bg-white shadow-sm';
  const navText = isDark
    ? 'text-white hover:text-[#F74646]'
    : 'text-gray-700 hover:text-blue-600';
  const mobileBg = isDark ? 'bg-black border-white/10' : 'bg-white border-gray-200';
  const mobileText = isDark
    ? 'text-white hover:text-[#F74646]'
    : 'text-gray-700 hover:text-blue-600';
  const mobileDivider = isDark ? 'border-white/10' : 'border-gray-200';
  const hamburgerColor = isDark ? 'text-[#C30000]' : 'text-gray-600';
  const pageBg = isDark ? 'bg-black' : 'bg-white';
  const mainText = isDark ? 'text-white' : 'text-gray-900';
  const dropdownBg = isDark ? 'bg-black border-white/10' : 'bg-white border-gray-200';
  const dropdownHover = isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50';

  return (
    <div className={`${pageBg} min-h-screen`}>
      {/* Header */}
      <header className={`${headerBg} ${isPaper ? 'relative z-40' : 'sticky top-0 z-40'}`}>
        <div className="max-w-[1140px] mx-auto px-4">
          {/* Logo - centered */}
          <div className="flex justify-center py-2">
            <Link href="/" className={showFullLogo ? '' : 'overflow-hidden'}>
              <Image
                src="/images/brand/logos/diamond-logo.png"
                alt="Banwell Designs"
                width={220}
                height={80}
                className={`h-auto ${isDark ? '' : 'brightness-0'} ${showFullLogo ? '' : 'ml-[-62px]'}`}
                priority
              />
            </Link>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex justify-center items-center gap-1 pb-3">
            <Link href="/leather" className={`px-4 py-2 text-[16px] font-normal transition-colors ${navText}`}>
              Leather
            </Link>
            <Link href="/glass" className={`px-4 py-2 text-[16px] font-normal transition-colors ${navText}`}>
              Art Glass
            </Link>
            <Link href="/paper" className={`px-4 py-2 text-[16px] font-normal transition-colors ${navText}`}>
              Paper Art
            </Link>

            {/* Shop Dropdown */}
            <div ref={dropdownRef} className="relative">
              <button
                onClick={() => setShopDropdownOpen(!shopDropdownOpen)}
                className={`px-4 py-2 text-[16px] font-normal transition-colors inline-flex items-center gap-1 ${navText}`}
              >
                Shop
                <svg className={`w-3.5 h-3.5 transition-transform ${shopDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {shopDropdownOpen && (
                <div className={`absolute top-full left-0 mt-1 ${dropdownBg} border rounded-lg shadow-lg min-w-[160px] py-1 z-50`}>
                  {shopCategories.map((cat) => (
                    <a
                      key={cat.label}
                      href={cat.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setShopDropdownOpen(false)}
                      className={`block px-4 py-2 text-[14px] font-normal transition-colors ${navText} ${dropdownHover}`}
                    >
                      {cat.label}
                    </a>
                  ))}
                </div>
              )}
            </div>

            <Link href="/licensing" className={`px-4 py-2 text-[16px] font-normal transition-colors ${navText}`}>
              Copyright &amp; Licensing
            </Link>
            <Link href="/about" className={`px-4 py-2 text-[16px] font-normal transition-colors ${navText}`}>
              About
            </Link>
            <Link href="/catalog" className={`px-4 py-2 text-[16px] font-normal transition-colors ${navText}`}>
              Wholesale
            </Link>
          </nav>

          {/* Mobile menu toggle */}
          <div className="md:hidden flex justify-end pb-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`${hamburgerColor} p-2`}
              aria-label="Toggle menu"
            >
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className={`md:hidden ${mobileBg} border-t`}>
            <div className="max-w-[1140px] mx-auto px-4 py-4 space-y-1">
              <Link href="/leather" onClick={() => setMobileMenuOpen(false)} className={`block py-2 text-[14px] font-normal transition-colors ${mobileText}`}>
                Leather
              </Link>
              <Link href="/glass" onClick={() => setMobileMenuOpen(false)} className={`block py-2 text-[14px] font-normal transition-colors ${mobileText}`}>
                Art Glass
              </Link>
              <Link href="/paper" onClick={() => setMobileMenuOpen(false)} className={`block py-2 text-[14px] font-normal transition-colors ${mobileText}`}>
                Paper Art
              </Link>

              {/* Mobile Shop accordion */}
              <button
                onClick={() => setMobileShopOpen(!mobileShopOpen)}
                className={`w-full flex items-center justify-between py-2 text-[14px] font-normal transition-colors ${mobileText}`}
              >
                Shop
                <svg className={`w-3.5 h-3.5 transition-transform ${mobileShopOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {mobileShopOpen && (
                <div className="pl-4 space-y-1">
                  {shopCategories.map((cat) => (
                    <a
                      key={cat.label}
                      href={cat.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => { setMobileMenuOpen(false); setMobileShopOpen(false); }}
                      className={`block py-2 text-[13px] font-normal transition-colors ${mobileText}`}
                    >
                      {cat.label}
                    </a>
                  ))}
                </div>
              )}

              <Link href="/licensing" onClick={() => setMobileMenuOpen(false)} className={`block py-2 text-[14px] font-normal transition-colors ${mobileText}`}>
                Copyright &amp; Licensing
              </Link>
              <Link href="/about" onClick={() => setMobileMenuOpen(false)} className={`block py-2 text-[14px] font-normal transition-colors ${mobileText}`}>
                About
              </Link>

              <div className={`border-t ${mobileDivider} my-2`} />
              <Link href="/catalog" onClick={() => setMobileMenuOpen(false)} className={`block py-2 text-[14px] font-normal transition-colors ${mobileText}`}>
                Wholesale Catalog
              </Link>
              <Link href="/pricing" onClick={() => setMobileMenuOpen(false)} className={`block py-2 text-[14px] font-normal transition-colors ${mobileText}`}>
                Wholesale Pricing
              </Link>
              <Link href="/login" onClick={() => setMobileMenuOpen(false)} className={`block py-2 text-[14px] font-normal transition-colors ${mobileText}`}>
                Sign In
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Torn paper edge for paper pages */}
      {isPaper && (
        <div className="relative z-30 -mb-4">
          <svg viewBox="0 0 1200 40" preserveAspectRatio="none" className="w-full h-[40px] block">
            <path
              d="M0,0 L0,18 Q15,22 30,17 Q50,10 70,20 Q85,28 100,15 Q120,5 140,18 Q155,26 170,14 Q190,4 210,20 Q225,30 245,16 Q260,6 280,19 Q300,28 320,13 Q340,3 360,18 Q375,26 395,14 Q410,5 430,21 Q450,30 470,15 Q485,6 505,19 Q520,27 540,13 Q560,4 580,20 Q595,28 615,15 Q630,5 650,18 Q670,27 690,14 Q705,4 725,20 Q740,28 760,15 Q780,5 800,19 Q815,27 835,13 Q855,4 875,20 Q890,28 910,15 Q930,5 950,18 Q965,26 985,14 Q1005,5 1025,20 Q1040,28 1060,15 Q1080,5 1100,19 Q1115,27 1135,14 Q1155,5 1175,18 L1200,15 L1200,0 Z"
              fill="#F5E6D0"
            />
          </svg>
        </div>
      )}

      <main className={`${pageBg} ${mainText}`}>{children}</main>
      <Footer isDark={isDark} />
    </div>
  );
}
