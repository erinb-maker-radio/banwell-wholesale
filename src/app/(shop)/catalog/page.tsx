'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatCurrency, etsyImageHD } from '@/lib/utils';
import type { Product, ProductCategory } from '@/lib/types';
import { useAuth } from '@/components/AuthProvider';
import { useCart } from '@/components/CartProvider';
import { MASK_COLORS, isMaskSlug } from '@/lib/colors';

export default function CatalogPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [favorites, setFavorites] = useState<Map<string, string>>(new Map());
  const { customer, loading: authLoading } = useAuth();
  const { addItem } = useCart();
  const [cardColors, setCardColors] = useState<Map<string, string>>(new Map());
  const perPage = 48;

  useEffect(() => {
    fetch('/api/public/categories')
      .then(res => res.json())
      .then(data => { if (data.data) setCategories(data.data); })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (authLoading || !customer) return;

    fetch('/api/account/favorites')
      .then(res => res.json())
      .then(data => {
        const favMap = new Map<string, string>();
        (data.favorites || []).forEach((f: { id: string; product: { id: string } }) => {
          favMap.set(f.product.id, f.id);
        });
        setFavorites(favMap);
      })
      .catch(console.error);
  }, [customer, authLoading]);

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

  async function toggleFavorite(e: React.MouseEvent, productId: string) {
    e.preventDefault();
    if (!customer) return;

    const favoriteId = favorites.get(productId);

    try {
      if (favoriteId) {
        // Remove favorite
        const res = await fetch('/api/account/favorites', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ favoriteId }),
        });
        if (res.ok) {
          setFavorites(prev => {
            const newMap = new Map(prev);
            newMap.delete(productId);
            return newMap;
          });
        }
      } else {
        // Add favorite
        const res = await fetch('/api/account/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId }),
        });
        if (res.ok) {
          const data = await res.json();
          setFavorites(prev => {
            const newMap = new Map(prev);
            newMap.set(productId, data.favoriteId);
            return newMap;
          });
        }
      }
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
    }
  }

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
            {products.map(product => {
              const isFavorited = favorites.has(product.id);
              const isMask = isMaskSlug(product.expand?.category?.slug);
              const chosenColor = cardColors.get(product.id) || MASK_COLORS[0];
              return (
                <div key={product.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group relative">
                  <Link href={`/product/${product.id}`}>
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
                  {customer && (
                    <button
                      onClick={(e) => toggleFavorite(e, product.id)}
                      className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full shadow-sm hover:bg-white transition-colors"
                      title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      {isFavorited ? (
                        <svg className="w-5 h-5 text-yellow-500 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-gray-400 hover:text-yellow-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                      )}
                    </button>
                  )}
                  {customer && (
                    <div className="px-3 pb-3 space-y-1.5">
                      {isMask && (
                        <select
                          value={chosenColor}
                          onChange={(e) => setCardColors(prev => new Map(prev).set(product.id, e.target.value))}
                          className="w-full text-xs border border-gray-300 rounded py-1 px-1.5 bg-white text-gray-900"
                          aria-label="Color"
                        >
                          {MASK_COLORS.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      )}
                      <button
                        onClick={() => addItem(product.id, 1, isMask ? chosenColor : undefined)}
                        className="w-full text-xs bg-blue-600 text-white rounded py-1.5 hover:bg-blue-700"
                      >
                        Add to Cart
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
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
