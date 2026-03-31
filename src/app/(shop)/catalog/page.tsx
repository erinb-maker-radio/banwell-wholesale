'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatCurrency, etsyImageHD } from '@/lib/utils';
import type { Product, ProductCategory } from '@/lib/types';

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
    fetch('/api/public/categories')
      .then(res => res.json())
      .then(data => { if (data.data) setCategories(data.data); })
      .catch(console.error);
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), perPage: String(perPage) });
    if (selectedCategory) params.set('category', selectedCategory);
    if (search) params.set('search', search);

    fetch(`/api/public/catalog?${params}`)
      .then(res => res.json())
      .then(data => {
        setProducts(data.items || []);
        setTotalPages(data.totalPages || 1);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page, selectedCategory, search]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Wholesale Pricing Tiers */}
      <div className="mb-6 bg-gray-50 border border-gray-200 rounded-lg px-5 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="font-semibold text-gray-900">Wholesale Pricing Tiers</p>
            <p className="text-xs text-gray-500">Discount applied to your entire cart based on total retail value.</p>
          </div>
          <div className="flex gap-4 sm:gap-6 text-sm">
            <div className="text-center">
              <p className="font-semibold text-gray-900">40% off</p>
              <p className="text-xs text-gray-500">$400+</p>
            </div>
            <div className="text-center">
              <p className="font-semibold text-gray-900">50% off</p>
              <p className="text-xs text-gray-500">$800+</p>
            </div>
            <div className="text-center">
              <p className="font-semibold text-emerald-700">55% off</p>
              <p className="text-xs text-gray-500">$1,200+</p>
            </div>
          </div>
        </div>
      </div>

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
