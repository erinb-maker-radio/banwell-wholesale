'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';
import type { Product, ProductCategory } from '@/lib/types';
import pb from '@/lib/pocketbase';

export default function CatalogPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const perPage = 48;

  useEffect(() => {
    pb.collection('product_categories').getFullList({ sort: 'sort_order' })
      .then(records => setCategories(records as unknown as ProductCategory[]))
      .catch(console.error);
  }, []);

  useEffect(() => {
    setLoading(true);
    let filter = 'is_active=true';
    if (selectedCategory) {
      filter += ` && category="${selectedCategory}"`;
    }
    if (search) {
      filter += ` && (title~"${search}" || sku~"${search}")`;
    }

    pb.collection('products').getList(page, perPage, {
      filter,
      sort: 'sort_order',
      expand: 'category',
    })
      .then(result => {
        setProducts(result.items as unknown as Product[]);
        setTotalPages(result.totalPages);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page, selectedCategory, search]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Product Catalog</h1>
        <p className="text-gray-500 mt-1">Browse our full collection of wholesale products</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-80"
        />
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => { setSelectedCategory(''); setPage(1); }}
            className={`px-3 py-1.5 text-sm rounded-full ${!selectedCategory ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            All
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => { setSelectedCategory(cat.id); setPage(1); }}
              className={`px-3 py-1.5 text-sm rounded-full ${selectedCategory === cat.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Product grid */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading products...</div>
      ) : products.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No products found</div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {products.map(product => (
              <Link
                key={product.id}
                href={`/product/${product.id}`}
                className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group"
              >
                <div className="aspect-square bg-gray-100 relative overflow-hidden">
                  {(product.image_url || product.image) && (
                    <img
                      src={product.image_url || ''}
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
                  {product.size && (
                    <p className="text-xs text-gray-500">{product.size}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
