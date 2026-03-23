'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatCurrency, etsyImageHD } from '@/lib/utils';
import type { Product } from '@/lib/types';
import Button from '@/components/ui/Button';
import { useCart } from '@/components/CartProvider';
import { useAuth } from '@/components/AuthProvider';

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<{ id: string; product: Product }[]>([]);
  const [loading, setLoading] = useState(true);
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
        {favorites.map(({ id, product }) => (
          <div key={id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <Link href={`/product/${product.id}`}>
              <div className="aspect-square bg-gray-100 overflow-hidden">
                {product.image_url && <img src={etsyImageHD(product.image_url)} alt={product.short_title} className="w-full h-full object-cover" loading="lazy" />}
              </div>
            </Link>
            <div className="p-3">
              <p className="text-sm font-medium text-gray-900 line-clamp-2">{product.short_title || product.title}</p>
              <p className="text-sm font-semibold text-blue-600 mt-1">{formatCurrency(product.retail_price)}</p>
              <div className="flex gap-1 mt-2">
                <button onClick={() => addItem(product.id)} className="flex-1 text-xs bg-blue-600 text-white rounded py-1.5 hover:bg-blue-700">Add to Cart</button>
                <button onClick={() => removeFavorite(id)} className="text-xs border rounded px-2 py-1.5 text-red-600 hover:bg-red-50">Remove</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
