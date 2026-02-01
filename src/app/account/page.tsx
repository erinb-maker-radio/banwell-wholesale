'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';
import type { Product } from '@/lib/types';
import pb from '@/lib/pocketbase';
import Button from '@/components/ui/Button';
import { useCart } from '@/components/CartProvider';

export default function MyCatalogPage() {
  const [curatedProducts, setCuratedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();

  useEffect(() => {
    async function load() {
      try {
        const customerId = pb.authStore.record?.id;
        if (!customerId) return;

        const curated = await pb.collection('curated_products').getFullList({
          filter: `customer="${customerId}"`,
          expand: 'product',
          sort: 'sort_order',
        });

        const products = curated
          .map(c => c.expand?.product as unknown as Product)
          .filter(Boolean);

        setCuratedProducts(products);
      } catch (err) {
        console.error('Failed to load curated catalog:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <div className="text-center py-12 text-gray-500">Loading your catalog...</div>;

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
        {curatedProducts.map(product => (
          <div key={product.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <Link href={`/product/${product.id}`}>
              <div className="aspect-square bg-gray-100 overflow-hidden">
                {product.image_url && (
                  <img src={product.image_url} alt={product.short_title || product.title} className="w-full h-full object-cover" loading="lazy" />
                )}
              </div>
            </Link>
            <div className="p-3">
              <p className="text-sm font-medium text-gray-900 line-clamp-2">{product.short_title || product.title}</p>
              <p className="text-xs text-gray-400">{product.sku}</p>
              <p className="text-sm font-semibold text-blue-600 mt-1">{formatCurrency(product.retail_price)}</p>
              <button
                onClick={() => addItem(product.id)}
                className="mt-2 w-full text-xs bg-blue-600 text-white rounded py-1.5 hover:bg-blue-700"
              >
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
