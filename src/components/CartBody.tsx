'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import pb from '@/lib/pocketbase';
import { useCart } from '@/components/CartProvider';
import { useAuth } from '@/components/AuthProvider';
import { calculateDiscount } from '@/lib/pricing';
import { formatCurrency, etsyImageHD } from '@/lib/utils';
import type { Product, DiscountTierLevel } from '@/lib/types';

// Shared cart contents used by both the desktop sidebar and the mobile drawer.
// Render this inside a flex-col container; it fills the available height.
export default function CartBody({ onClose }: { onClose?: () => void }) {
  const { items, updateQuantity, removeItem, itemCount } = useCart();
  const { customer } = useAuth();
  const [products, setProducts] = useState<Map<string, Product>>(new Map());
  const [pulseId, setPulseId] = useState<string | null>(null);
  const prevCountRef = useRef(itemCount);

  const lineKey = (i: { productId: string; color?: string }) => `${i.productId}::${i.color ?? ''}`;

  // Brief highlight on the most-recently-added item
  useEffect(() => {
    if (itemCount > prevCountRef.current && items.length > 0) {
      setPulseId(lineKey(items[items.length - 1]));
      const t = setTimeout(() => setPulseId(null), 1200);
      return () => clearTimeout(t);
    }
    prevCountRef.current = itemCount;
  }, [itemCount, items]);

  // Resolve product details for the items in the cart
  // Resolve product details for cart items. Depends on `items` ONLY — using
  // functional setState so we never list `products` as a dep (which would loop:
  // setProducts(new Map()) → new ref → effect re-runs → infinite re-render,
  // which freezes router transitions and makes the whole UI feel "dead").
  useEffect(() => {
    let cancelled = false;
    if (items.length === 0) {
      setProducts(prev => (prev.size === 0 ? prev : new Map()));
      return;
    }
    (async () => {
      const fetched = await Promise.all(items.map(async (i) => {
        try {
          const r = await pb.collection('products').getOne(i.productId);
          return [i.productId, r as unknown as Product] as const;
        } catch {
          return null;
        }
      }));
      if (cancelled) return;
      setProducts(prev => {
        const next = new Map(prev);
        let added = false;
        for (const entry of fetched) {
          if (entry && !next.has(entry[0])) { next.set(entry[0], entry[1]); added = true; }
        }
        return added ? next : prev;
      });
    })();
    return () => { cancelled = true; };
  }, [items]);

  const tier = (customer?.discount_tier || 'auto') as DiscountTierLevel;
  const subtotal = items.reduce((sum, item) => {
    const p = products.get(item.productId);
    return sum + (p ? p.retail_price * item.quantity : 0);
  }, 0);
  const discount = calculateDiscount(subtotal, tier);

  return (
    <>
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <div className="font-semibold text-gray-900">
          Cart {itemCount > 0 && <span className="text-sm text-gray-500 font-normal">· {itemCount} item{itemCount !== 1 ? 's' : ''}</span>}
        </div>
        <div className="flex items-center gap-3">
          <Link href="/account/cart" onClick={onClose} className="text-xs text-blue-600 hover:underline">View full cart</Link>
          {onClose && (
            <button onClick={onClose} aria-label="Close cart" className="text-gray-400 hover:text-gray-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {items.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center text-gray-500">
          <svg className="w-10 h-10 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
          </svg>
          <div className="text-sm font-medium text-gray-700">Your cart is empty</div>
          <div className="text-xs mt-1">Add items from the catalog or your favorites.</div>
        </div>
      ) : (
        <>
          <ul className="flex-1 overflow-y-auto divide-y divide-gray-100">
            {items.map(item => {
              const p = products.get(item.productId);
              const lineTotal = p ? p.retail_price * item.quantity : 0;
              const pulsing = pulseId === lineKey(item);
              return (
                <li
                  key={lineKey(item)}
                  className={`px-4 py-3 flex gap-3 transition-colors ${pulsing ? 'bg-amber-50' : 'bg-white'}`}
                >
                  <div className="w-14 h-14 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
                    {p?.image_url ? (
                      <img src={etsyImageHD(p.image_url)} alt={p.short_title || p.title} className="w-full h-full object-cover" loading="lazy" />
                    ) : null}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-gray-900 line-clamp-2">
                      {p?.short_title || p?.title || '…'}
                    </div>
                    {p?.size && (
                      <div className="text-[11px] text-gray-500 mt-0.5">Size: {p.size}</div>
                    )}
                    {item.color && (
                      <div className="text-[11px] text-gray-500 mt-0.5">Color: {item.color}</div>
                    )}
                    <div className="mt-1 flex items-center justify-between">
                      <div className="inline-flex items-center border border-gray-200 rounded">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1, item.color)}
                          className="px-2 py-0.5 text-gray-500 hover:bg-gray-50"
                          aria-label="Decrease"
                        >−</button>
                        <span className="px-2.5 text-sm font-semibold tabular-nums text-gray-900 min-w-[1.75rem] text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1, item.color)}
                          className="px-2 py-0.5 text-gray-500 hover:bg-gray-50"
                          aria-label="Increase"
                        >+</button>
                      </div>
                      <div className="text-xs font-semibold text-gray-900 tabular-nums">
                        {p ? formatCurrency(lineTotal) : '…'}
                      </div>
                    </div>
                    <button
                      onClick={() => removeItem(item.productId, item.color)}
                      className="mt-1 text-[11px] text-red-600 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="border-t border-gray-200 px-4 py-3 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span className="tabular-nums">{formatCurrency(subtotal)}</span>
            </div>
            {discount.percent > 0 && (
              <>
                <div className="flex justify-between text-gray-600">
                  <span>Discount ({discount.percent}%)</span>
                  <span className="tabular-nums">−{formatCurrency(discount.amount)}</span>
                </div>
                <div className="flex justify-between font-semibold text-gray-900 mt-1">
                  <span>Total</span>
                  <span className="tabular-nums">{formatCurrency(discount.total)}</span>
                </div>
              </>
            )}
            {discount.percent === 0 && (
              <div className="text-[11px] text-gray-500 mt-1">
                Add {formatCurrency(40000 - subtotal)} more to reach Tier 1 (40% off)
              </div>
            )}
            <Link
              href="/account/cart"
              onClick={onClose}
              className="mt-3 block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-medium rounded py-2 text-sm"
            >
              View Cart & Checkout
            </Link>
          </div>
        </>
      )}
    </>
  );
}
