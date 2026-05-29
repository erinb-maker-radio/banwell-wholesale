'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatCurrency, etsyImageHD } from '@/lib/utils';
import type { Product } from '@/lib/types';
import Button from '@/components/ui/Button';
import { useCart } from '@/components/CartProvider';
import { useAuth } from '@/components/AuthProvider';
import { isMaskSlug } from '@/lib/colors';

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<{ id: string; product: Product }[]>([]);
  const [loading, setLoading] = useState(true);
  const [qtys, setQtys] = useState<Map<string, number>>(new Map());
  const { addItem } = useCart();
  const { customer, loading: authLoading } = useAuth();

  useEffect(() => {
    if (authLoading) return;
    if (!customer) { setLoading(false); return; }

    fetch('/api/account/favorites')
      .then(res => res.json())
      .then(data => setFavorites(data.favorites || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [customer, authLoading]);

  async function removeFavorite(favId: string) {
    try {
      const res = await fetch('/api/account/favorites', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ favoriteId: favId }),
      });
      if (res.ok) {
        setFavorites(prev => prev.filter(f => f.id !== favId));
      }
    } catch (err) {
      console.error(err);
    }
  }

  if (loading || authLoading) return <div className="text-center py-12 text-gray-500">Loading...</div>;

  if (favorites.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">No favorites yet</h2>
        <p className="text-gray-500 mb-6">Save products you like for easy access later.</p>
        <Link href="/catalog"><Button>Browse Catalog</Button></Link>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-6">Favorites</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {favorites.map(({ id, product }) => {
          const isMask = isMaskSlug(product.expand?.category?.slug);
          const qty = qtys.get(product.id) || 1;
          const setQty = (n: number) => setQtys(prev => new Map(prev).set(product.id, Math.max(1, n)));
          return (
          <div key={id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <Link href={`/product/${product.id}`}>
              <div className="aspect-square bg-gray-100 overflow-hidden">
                {product.image_url && <img src={etsyImageHD(product.image_url)} alt={product.short_title} className="w-full h-full object-cover" loading="lazy" />}
              </div>
            </Link>
            <div className="p-3">
              <p className="text-sm font-medium text-gray-900 line-clamp-2">{product.short_title || product.title}</p>
              <p className="text-sm font-semibold text-blue-600 mt-1">{formatCurrency(product.retail_price)}</p>
              {!isMask && (
                <div className="flex items-center justify-center gap-1 mt-2">
                  <button onClick={() => setQty(qty - 1)} className="w-6 h-6 flex items-center justify-center border border-gray-300 rounded text-gray-600 hover:bg-gray-50" aria-label="Decrease quantity">−</button>
                  <span className="text-xs font-semibold tabular-nums text-gray-900 min-w-[1.5rem] text-center">{qty}</span>
                  <button onClick={() => setQty(qty + 1)} className="w-6 h-6 flex items-center justify-center border border-gray-300 rounded text-gray-600 hover:bg-gray-50" aria-label="Increase quantity">+</button>
                </div>
              )}
              <div className="flex gap-1 mt-2">
                {isMask ? (
                  <Link href={`/product/${product.id}`} className="flex-1 text-xs text-center bg-blue-600 text-white rounded py-1.5 hover:bg-blue-700">Choose color</Link>
                ) : (
                  <button onClick={() => addItem(product.id, qty)} className="flex-1 text-xs bg-blue-600 text-white rounded py-1.5 hover:bg-blue-700">Add to Cart</button>
                )}
                <button onClick={() => removeFavorite(id)} className="text-xs border rounded px-2 py-1.5 text-red-600 hover:bg-red-50">Remove</button>
              </div>
            </div>
          </div>
          );
        })}
      </div>
    </div>
  );
}
