'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useCart } from '@/components/CartProvider';
import { useAuth } from '@/components/AuthProvider';
import CartBody from '@/components/CartBody';

// Floating cart button with item-count badge + slide-in drawer.
// Mobile/tablet only (< lg); the desktop sidebar takes over at lg+.
export default function MobileCart() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { itemCount } = useCart();
  const { customer } = useAuth();

  // Redundant on the cart/checkout pages; logged-in customers only
  const hideOnPath = pathname === '/account/cart' || pathname?.startsWith('/account/checkout');
  if (hideOnPath || !customer) return null;

  return (
    <div className="lg:hidden">
      {/* Floating action button */}
      <button
        onClick={() => setOpen(true)}
        aria-label={`Open cart${itemCount > 0 ? `, ${itemCount} items` : ''}`}
        className="fixed bottom-4 right-4 z-40 flex items-center justify-center w-14 h-14 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 active:scale-95 transition-transform"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
        </svg>
        {itemCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 flex items-center justify-center rounded-full bg-red-600 text-white text-[11px] font-semibold leading-none">
            {itemCount}
          </span>
        )}
      </button>

      {/* Backdrop + drawer */}
      {open && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div
            className="fixed inset-y-0 right-0 z-50 w-[88%] max-w-sm bg-white shadow-xl flex flex-col"
            role="dialog"
            aria-modal="true"
            aria-label="Cart"
          >
            <CartBody onClose={() => setOpen(false)} />
          </div>
        </>
      )}
    </div>
  );
}
