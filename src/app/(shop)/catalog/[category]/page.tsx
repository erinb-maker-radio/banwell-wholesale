'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';
import type { Product, ProductCategory } from '@/lib/types';
import pb from '@/lib/pocketbase';

export default function CategoryPage() {
  const params = useParams();
  const slug = params.category as string;
  const [category, setCategory] = useState<ProductCategory | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const perPage = 48;

  useEffect(() => {
    pb.collection('product_categories').getFirstListItem(`slug="${slug}"`)
      .then(record => setCategory(record as unknown as ProductCategory))
      .catch(console.error);
  }, [slug]);

  useEffect(() => {
    if (!category) return;
    setLoading(true);
    pb.collection('products').getList(page, perPage, {
      filter: `is_active=true && category="${category.id}"`,
      sort: 'sort_order',
    })
      .then(result => {
        setProducts(result.items as unknown as Product[]);
        setTotalPages(result.totalPages);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [category, page]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-2">
        <Link href="/catalog" className="text-sm text-blue-600 hover:underline">&larr; All Products</Link>
      </div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{category?.name || 'Loading...'}</h1>
        {category?.description && (
          <p className="text-gray-500 mt-1">{category.description}</p>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {products.map(product => (
              <Link
                key={product.id}
                href={`/product/${product.id}`}
                className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group"
              >
                <div className="aspect-square bg-gray-100 overflow-hidden">
                  {product.image_url && (
                    <img
                      src={product.image_url}
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

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-50">Previous</button>
              <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-50">Next</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
