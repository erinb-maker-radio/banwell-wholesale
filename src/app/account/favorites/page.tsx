'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';
import type { Product } from '@/lib/types';
import pb from '@/lib/pocketbase';
import Button from '@/components/ui/Button';
import { useCart } from '@/components/CartProvider';

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<{ id: string; product: Product }[]>([]);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();

  useEffect(() => {
    const customerId = pb.authStore.record?.id;
    if (!customerId) return;

    pb.collection('favorites').getFullList({
      filter: `customer="${customerId}"`,
      expand: 'product',
      sort: '-created',
    })
      .then(records => {
        setFavorites(records.map(r => ({
          id: r.id,
          product: r.expand?.product as unknown as Product,
        })).filter(f => f.product));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  async function removeFavorite(favId: string) {
    try {
      await pb.collection('favorites').delete(favId);
      setFavorites(prev => prev.filter(f => f.id !== favId));
    } catch (err) {
      console.error(err);
    }
  }

  if (loading) return <div className="text-center py-12 text-gray-500">Loading...</div>;

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
                {product.image_url && <img src={product.image_url} alt={product.short_title} className="w-full h-full object-cover" loading="lazy" />}
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
