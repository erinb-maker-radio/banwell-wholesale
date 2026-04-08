'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatCurrency, etsyImageHD } from '@/lib/utils';
import type { Product } from '@/lib/types';
import pb from '@/lib/pocketbase';

export default function GlassCatalogPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'ornaments' | 'suncatchers'>('all');

  useEffect(() => {
    setLoading(true);
    // Fetch both glass categories
    Promise.all([
      pb.collection('product_categories').getFirstListItem('slug="glass-ornaments"'),
      pb.collection('product_categories').getFirstListItem('slug="glass-sun-catchers"'),
    ]).then(async ([ornCat, scCat]) => {
      const ornaments = await pb.collection('products').getFullList({
        filter: `is_active=true && category="${ornCat.id}"`,
        sort: 'sort_order',
      });
      const suncatchers = await pb.collection('products').getFullList({
        filter: `is_active=true && category="${scCat.id}"`,
        sort: 'sort_order',
      });
      // Tag each product with its sub-category for filtering
      const all = [
        ...suncatchers.map(p => ({ ...p, _sub: 'suncatchers' as const })),
        ...ornaments.map(p => ({ ...p, _sub: 'ornaments' as const })),
      ];
      setProducts(all as unknown as (Product & { _sub: string })[]);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all'
    ? products
    : products.filter((p: Product & { _sub?: string }) => p._sub === filter);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Glass Collection</h1>
        <p className="text-gray-500 mt-1">
          Stained glass style suncatchers and ornaments — designed and made in Chico, California
        </p>
      </div>

      {/* Sub-category filter */}
      <div className="flex gap-2 mb-6">
        {(['all', 'suncatchers', 'ornaments'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              filter === f
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {f === 'all' ? `All Glass (${products.length})` : f === 'suncatchers' ? `Sun Catchers (${products.filter((p: Product & { _sub?: string }) => p._sub === 'suncatchers').length})` : `Ornaments (${products.filter((p: Product & { _sub?: string }) => p._sub === 'ornaments').length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filtered.map(product => (
            <Link
              key={product.id}
              href={`/product/${product.id}`}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group"
            >
              <div className="aspect-square bg-gray-100 overflow-hidden">
                {product.image_url && (
                  <img
                    src={etsyImageHD(product.image_url)}
                    alt={product.short_title || product.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    loading="lazy"
                  />
                )}
              </div>
              <div className="p-3">
                <p className="text-sm font-medium text-gray-900 line-clamp-2">
                  {product.short_title || product.title}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{product.sku}</p>
                <p className="text-sm font-semibold text-blue-600 mt-1">
                  {formatCurrency(product.retail_price)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
