'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Footer from '@/components/layout/Footer';
import { AuthProvider, useAuth } from '@/components/AuthProvider';

const shopCategories = [
  { label: 'Leather', href: 'https://www.etsy.com/shop/banwelldesignleather' },
  { label: 'Art Glass', href: 'https://www.etsy.com/shop/BanwellDesigns' },
  { label: 'Paper Art', href: 'https://www.etsy.com/shop/banwelldesignpaper' },
];

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ShopLayoutInner>{children}</ShopLayoutInner>
    </AuthProvider>
  );
}

function ShopLayoutInner({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [shopDropdownOpen, setShopDropdownOpen] = useState(false);
  const [mobileShopOpen, setMobileShopOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const { customer, loading: authLoading, logout } = useAuth();

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

  const isDarkHeader = isDark || isPaper;
  const headerBg = isDark ? 'bg-black' : isPaper ? 'bg-[#1B4332]' : 'bg-white shadow-sm';
  const navText = isDarkHeader
    ? 'text-white hover:text-[#F74646]'
    : 'text-gray-700 hover:text-blue-600';
  const mobileBg = isDark ? 'bg-black border-white/10' : isPaper ? 'bg-[#1B4332] border-white/10' : 'bg-white border-gray-200';
  const mobileText = isDarkHeader
    ? 'text-white hover:text-[#F74646]'
    : 'text-gray-700 hover:text-blue-600';
  const mobileDivider = isDarkHeader ? 'border-white/10' : 'border-gray-200';
  const hamburgerColor = isDarkHeader ? 'text-[#C30000]' : 'text-gray-600';
  const pageBg = isDark ? 'bg-black' : isPaper ? 'bg-transparent' : 'bg-white';
  const mainText = isDark ? 'text-white' : 'text-gray-900';
  const dropdownBg = isDark ? 'bg-black border-white/10' : isPaper ? 'bg-[#1B4332] border-white/10' : 'bg-white border-gray-200';
  const dropdownHover = isDarkHeader ? 'hover:bg-white/5' : 'hover:bg-gray-50';

  return (
    <div
      className={`${pageBg} min-h-screen ${isPaper ? 'bg-fixed bg-cover bg-center' : ''}`}
      style={isPaper ? { backgroundImage: "url('/images/brand/paper/paper-bg.png')" } : undefined}
    >
      {/* Header */}
      <header
        className={`${headerBg} sticky top-0 z-40`}
      >
        <div className="max-w-[1140px] mx-auto px-4">
          {/* Logo */}
          <div className="flex justify-center py-2">
            <Link href="/" className={showFullLogo ? '' : 'overflow-hidden'}>
              <Image
                src="/images/brand/logos/diamond-logo.png"
                alt="Banwell Designs"
                width={220}
                height={80}
                className={`h-auto ${isDarkHeader ? '' : 'brightness-0'} ${showFullLogo ? '' : 'ml-[-62px]'}`}
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
              {isDark ? 'About Tom Banwell' : 'About'}
            </Link>
            {!isDark && !authLoading && (
              customer ? (
                <>
                  <Link href="/account" className={`px-4 py-2 text-[16px] font-normal transition-colors ${navText}`}>
                    My Account
                  </Link>
                  <button onClick={logout} className={`px-4 py-2 text-[16px] font-normal transition-colors ${navText}`}>
                    Log Out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/catalog" className={`px-4 py-2 text-[16px] font-normal transition-colors ${navText}`}>
                    Wholesale
                  </Link>
                  <Link href="/login" className={`px-4 py-2 text-[16px] font-normal transition-colors ${navText}`}>
                    Sign In
                  </Link>
                </>
              )
            )}
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
                {isDark ? 'About Tom Banwell' : 'About'}
              </Link>

              {!isDark && !authLoading && (
                <>
                  <div className={`border-t ${mobileDivider} my-2`} />
                  <Link href="/catalog" onClick={() => setMobileMenuOpen(false)} className={`block py-2 text-[14px] font-normal transition-colors ${mobileText}`}>
                    Wholesale Catalog
                  </Link>
                  <Link href="/pricing" onClick={() => setMobileMenuOpen(false)} className={`block py-2 text-[14px] font-normal transition-colors ${mobileText}`}>
                    Wholesale Pricing
                  </Link>
                  {customer ? (
                    <>
                      <Link href="/account" onClick={() => setMobileMenuOpen(false)} className={`block py-2 text-[14px] font-normal transition-colors ${mobileText}`}>
                        My Account
                      </Link>
                      <button onClick={() => { logout(); setMobileMenuOpen(false); }} className={`block w-full text-left py-2 text-[14px] font-normal transition-colors ${mobileText}`}>
                        Log Out
                      </button>
                    </>
                  ) : (
                    <Link href="/login" onClick={() => setMobileMenuOpen(false)} className={`block py-2 text-[14px] font-normal transition-colors ${mobileText}`}>
                      Sign In
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </header>


      <main className={`${pageBg} ${mainText}`}>{children}</main>
      <Footer isDark={isDark} />
    </div>
  );
}
