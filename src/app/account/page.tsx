'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatCurrency, etsyImageHD } from '@/lib/utils';
import type { Product } from '@/lib/types';
import Button from '@/components/ui/Button';
import { useCart } from '@/components/CartProvider';
import { useAuth } from '@/components/AuthProvider';
import { MASK_COLORS, isMaskSlug } from '@/lib/colors';

export default function MyCatalogPage() {
  const [curatedProducts, setCuratedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [cardColors, setCardColors] = useState<Map<string, string>>(new Map());
  const [cardQtys, setCardQtys] = useState<Map<string, number>>(new Map());
  const { addItem } = useCart();
  const { customer, loading: authLoading } = useAuth();

  useEffect(() => {
    if (authLoading) return;
    if (!customer) { setLoading(false); return; }

    fetch('/api/account/curated')
      .then(res => res.json())
      .then(data => setCuratedProducts(data.products || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [customer, authLoading]);

  if (loading || authLoading) return <div className="text-center py-12 text-gray-500">Loading your catalog...</div>;

  if (curatedProducts.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Your personalized catalog is being prepared</h2>
        <p className="text-gray-500 mb-6">We&apos;ll curate a selection of products for you. In the meantime, browse our full catalog.</p>
        <Link href="/catalog">
          <Button>Browse Full Catalog</Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">My Catalog</h2>
        <Link href="/catalog" className="text-sm text-blue-600 hover:underline">
          Browse Full Catalog &rarr;
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {curatedProducts.map(product => {
          const isMask = isMaskSlug(product.expand?.category?.slug);
          const chosenColor = cardColors.get(product.id) || '';
          const qty = cardQtys.get(product.id) || 1;
          const setQty = (n: number) => setCardQtys(prev => new Map(prev).set(product.id, Math.max(1, n)));
          return (
          <div key={product.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <Link href={`/product/${product.id}`}>
              <div className="aspect-square bg-gray-100 overflow-hidden">
                {product.image_url && (
                  <img src={etsyImageHD(product.image_url)} alt={product.short_title || product.title} className="w-full h-full object-cover" loading="lazy" />
                )}
              </div>
            </Link>
            <div className="p-3">
              <p className="text-sm font-medium text-gray-900 line-clamp-2">{product.short_title || product.title}</p>
              <p className="text-xs text-gray-400">{product.sku}</p>
              <p className="text-sm font-semibold text-blue-600 mt-1">{formatCurrency(product.retail_price)}</p>

              {isMask && (
                <select
                  value={chosenColor}
                  onChange={(e) => setCardColors(prev => new Map(prev).set(product.id, e.target.value))}
                  className={`mt-2 w-full text-xs border rounded py-1 px-1.5 bg-white ${chosenColor ? 'border-gray-300 text-gray-900' : 'border-amber-400 text-gray-500'}`}
                  aria-label="Color"
                >
                  <option value="" disabled>Choose color…</option>
                  {MASK_COLORS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              )}

              <div className="flex items-center justify-center gap-1 mt-2">
                <button onClick={() => setQty(qty - 1)} className="w-6 h-6 flex items-center justify-center border border-gray-300 rounded text-gray-600 hover:bg-gray-50" aria-label="Decrease quantity">−</button>
                <span className="text-xs font-semibold tabular-nums text-gray-900 min-w-[1.5rem] text-center">{qty}</span>
                <button onClick={() => setQty(qty + 1)} className="w-6 h-6 flex items-center justify-center border border-gray-300 rounded text-gray-600 hover:bg-gray-50" aria-label="Increase quantity">+</button>
              </div>

              <button
                onClick={() => addItem(product.id, qty, isMask ? chosenColor : undefined)}
                disabled={isMask && !chosenColor}
                className="mt-2 w-full text-xs bg-blue-600 text-white rounded py-1.5 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {isMask && !chosenColor ? 'Choose a color' : 'Add to Cart'}
              </button>
            </div>
          </div>
          );
        })}
      </div>
    </div>
  );
}
