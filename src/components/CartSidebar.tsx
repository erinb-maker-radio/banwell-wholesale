'use client';

import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import CartBody from '@/components/CartBody';

// Fixed right-side cart, lg+ only. Compact always-visible mirror of /account/cart
// so customers see additions immediately. Shares CartBody with the mobile drawer.
export default function CartSidebar({ top = '4rem' }: { top?: string }) {
  const pathname = usePathname();
  const { customer } = useAuth();

  // Redundant on the cart/checkout pages; logged-in customers only
  const hideOnPath = pathname === '/account/cart' || pathname?.startsWith('/account/checkout');
  if (hideOnPath || !customer) return null;

  return (
    <aside
      className="hidden lg:flex flex-col fixed right-0 bottom-0 w-80 bg-white border-l border-gray-200 shadow-sm z-30"
      style={{ top }}
      aria-label="Cart"
    >
      <CartBody />
    </aside>
  );
}
