'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';
import { calculateDiscount } from '@/lib/pricing';
import type { Product } from '@/lib/types';
import pb from '@/lib/pocketbase';
import Button from '@/components/ui/Button';
import { useCart } from '@/components/CartProvider';

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart } = useCart();
  const [products, setProducts] = useState<Map<string, Product>>(new Map());
  const [loading, setLoading] = useState(true);
  const [customerTier, setCustomerTier] = useState<string>('auto');

  useEffect(() => {
    async function loadProducts() {
      if (items.length === 0) { setLoading(false); return; }

      const productMap = new Map<string, Product>();
      for (const item of items) {
        try {
          const record = await pb.collection('products').getOne(item.productId);
          productMap.set(item.productId, record as unknown as Product);
        } catch { /* product may have been removed */ }
      }
      setProducts(productMap);

      // Get customer tier
      try {
        const customer = pb.authStore.record;
        if (customer?.discount_tier) {
          setCustomerTier(customer.discount_tier);
        }
      } catch { /* ignore */ }

      setLoading(false);
    }
    loadProducts();
  }, [items]);

  const subtotal = items.reduce((sum, item) => {
    const product = products.get(item.productId);
    return sum + (product ? product.retail_price * item.quantity : 0);
  }, 0);

  const discount = calculateDiscount(subtotal, customerTier as 'auto' | 'tier1' | 'tier2' | 'tier3');

  if (loading) return <div className="text-center py-12 text-gray-500">Loading cart...</div>;

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
        </svg>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-6">Start adding products from the catalog.</p>
        <Link href="/catalog"><Button>Browse Catalog</Button></Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">Shopping Cart</h2>
        <button onClick={clearCart} className="text-sm text-red-600 hover:underline">Clear Cart</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart items */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border divide-y">
            {items.map(item => {
              const product = products.get(item.productId);
              if (!product) return null;

              return (
                <div key={item.productId} className="flex items-center p-4 gap-4">
                  <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                    {product.image_url && (
                      <img src={product.image_url} alt={product.short_title} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{product.short_title || product.title}</p>
                    <p className="text-xs text-gray-400">{product.sku}</p>
                    <p className="text-sm text-gray-600">{formatCurrency(product.retail_price)} each</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="w-8 h-8 border rounded text-gray-600 hover:bg-gray-50"
                    >-</button>
                    <span className="w-8 text-center text-sm">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="w-8 h-8 border rounded text-gray-600 hover:bg-gray-50"
                    >+</button>
                  </div>
                  <div className="text-right w-24">
                    <p className="text-sm font-medium">{formatCurrency(product.retail_price * item.quantity)}</p>
                  </div>
                  <button
                    onClick={() => removeItem(item.productId)}
                    className="text-gray-400 hover:text-red-600"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order summary */}
        <div>
          <div className="bg-white rounded-lg border p-6 sticky top-24">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>

              {discount.percent > 0 && (
                <div className="flex justify-between text-green-700">
                  <span>{discount.tierName}</span>
                  <span>-{formatCurrency(discount.amount)}</span>
                </div>
              )}

              {discount.percent === 0 && subtotal > 0 && (
                <div className="bg-yellow-50 text-yellow-800 text-xs p-3 rounded-lg mt-2">
                  Add {formatCurrency(40000 - subtotal)} more to reach Tier 1 (40% off)
                </div>
              )}

              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>{formatCurrency(discount.total)}</span>
                </div>
              </div>
            </div>

            <Link href="/account/checkout" className="block mt-6">
              <Button className="w-full" size="lg">Proceed to Checkout</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
