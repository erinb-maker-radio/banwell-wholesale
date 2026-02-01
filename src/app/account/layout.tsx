'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { CartProvider } from '@/components/CartProvider';

const accountNav = [
  { name: 'My Catalog', href: '/account' },
  { name: 'Cart', href: '/account/cart' },
  { name: 'Orders', href: '/account/orders' },
  { name: 'Invoices', href: '/account/invoices' },
  { name: 'Favorites', href: '/account/favorites' },
  { name: 'Settings', href: '/account/settings' },
];

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <CartProvider>
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/catalog" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <span className="font-bold text-gray-900">Banwell Designs</span>
            </Link>

            <div className="flex items-center space-x-4">
              <Link href="/catalog" className="text-sm text-gray-600 hover:text-gray-900">
                Browse Catalog
              </Link>
              <Link href="/account/cart" className="text-gray-600 hover:text-gray-900">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                </svg>
              </Link>
              <button className="text-sm text-gray-600 hover:text-gray-900">
                Log Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Account nav tabs */}
        <nav className="flex space-x-1 border-b border-gray-200 mb-8">
          {accountNav.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== '/account' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'px-4 py-2 text-sm font-medium border-b-2 -mb-px',
                  isActive
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                )}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>

        {children}
      </div>
    </CartProvider>
  );
}
