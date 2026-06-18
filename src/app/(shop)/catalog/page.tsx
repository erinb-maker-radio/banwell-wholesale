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
  const [cardQtys, setCardQtys] = useState<Map<string, number>>(new Map());
  const [selectedSizes, setSelectedSizes] = useState<Map<string, string>>(new Map());
  const [sizeVariations, setSizeVariations] = useState<Map<string, Product[]>>(new Map());
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

  // Extract base design name (remove size info)
  const extractBaseName = (title: string): string => {
    return title
      .replace(/\s*\d+[""]\s*(ornament|suncatcher)?/gi, '')
      .replace(/\s*(ornament|suncatcher)\s*$/gi, '')
      .trim();
  };

  useEffect(() => {
    setLoading(true);
    // Fetch the FULL matching set so a design's size variants are never split
    // across server pages (grouping + pagination happen client-side, by design).
    const params = new URLSearchParams({ all: '1' });
    if (selectedCategory) params.set('category', selectedCategory);
    if (search) params.set('search', search);

    fetch(`/api/public/catalog?${params}`)
      .then(res => res.json())
      .then(data => {
        const allProducts: Product[] = data.items || [];

        // One card per design+category: a design's ornament and its suncatcher
        // are separate cards, and all sizes of one type group together. Keyed by
        // category (reliable) rather than a title/size heuristic.
        const designKey = (p: Product) => `${extractBaseName(p.short_title || p.title)}|${p.category}`;
        const uniqueDesigns = new Map<string, Product>();
        const variationsMap = new Map<string, Product[]>();

        allProducts.forEach((product: Product) => {
          const key = designKey(product);
          const existing = uniqueDesigns.get(key);
          // Representative = lowest-priced (smallest) size of this design+type.
          if (!existing || product.retail_price < existing.retail_price) {
            uniqueDesigns.set(key, product);
          }
        });

        // Attach all size variations (same design+category) to each representative.
        const uniqueProducts = Array.from(uniqueDesigns.values());
        uniqueProducts.forEach(product => {
          const key = designKey(product);
          const variations = allProducts
            .filter((p: Product) => designKey(p) === key)
            .sort((a: Product, b: Product) => a.retail_price - b.retail_price);
          if (variations.length > 1) {
            variationsMap.set(product.id, variations);
          }
        });

        setProducts(uniqueProducts);
        setSizeVariations(variationsMap);

        const defaultSizes = new Map<string, string>();
        uniqueProducts.forEach(product => defaultSizes.set(product.id, product.id));
        setSelectedSizes(defaultSizes);

        setPage(1);
        setTotalPages(Math.max(1, Math.ceil(uniqueProducts.length / perPage)));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedCategory, search]);

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
            {products.slice((page - 1) * perPage, page * perPage).map(product => {
              const variations = sizeVariations.get(product.id) || [];
              const selectedSizeId = selectedSizes.get(product.id) || product.id;
              const selectedProduct = variations.find(v => v.id === selectedSizeId) || product;
              const isFavorited = favorites.has(selectedProduct.id);
              const isMask = isMaskSlug(selectedProduct.expand?.category?.slug);
              const chosenColor = cardColors.get(product.id) || '';
              const qty = cardQtys.get(product.id) || 1;
              const setQty = (n: number) => setCardQtys(prev => new Map(prev).set(product.id, Math.max(1, n)));

              return (
                <div key={product.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group relative">
                  <Link href={`/product/${selectedProduct.id}`}>
                    <div className="aspect-square bg-gray-100 relative overflow-hidden">
                      {(selectedProduct.image_url || selectedProduct.image) && (
                        <img
                          src={etsyImageHD(selectedProduct.image_url)}
                          alt={selectedProduct.short_title || selectedProduct.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          loading="lazy"
                        />
                      )}
                    </div>
                    <div className="p-3">
                      <p className="text-sm font-medium text-gray-900 line-clamp-2">
                        {selectedProduct.short_title || selectedProduct.title}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">{selectedProduct.sku}</p>
                      {variations.length > 1 ? (
                        <div className="mt-1 space-y-0.5">
                          {variations.map(v => (
                            <div key={v.id} className="flex items-baseline justify-between gap-2 text-xs">
                              <span className="text-gray-500">{v.size || v.short_title}</span>
                              <span className="font-semibold text-blue-600">{formatCurrency(v.retail_price)}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <>
                          <p className="text-sm font-semibold text-blue-600 mt-1">
                            {formatCurrency(selectedProduct.retail_price)}
                          </p>
                          {selectedProduct.size && (
                            <p className="text-xs text-gray-500">{selectedProduct.size}</p>
                          )}
                        </>
                      )}
                    </div>
                  </Link>
                  {customer && (
                    <button
                      onClick={(e) => toggleFavorite(e, selectedProduct.id)}
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
                      {variations.length > 1 && (
                        <select
                          value={selectedSizeId}
                          onChange={(e) => {
                            setSelectedSizes(prev => new Map(prev).set(product.id, e.target.value));
                          }}
                          className="w-full text-xs border border-gray-300 rounded py-1 px-1.5 bg-white text-gray-900"
                          aria-label="Size"
                        >
                          {variations.map(v => (
                            <option key={v.id} value={v.id}>
                              {v.size || v.short_title} - {formatCurrency(v.retail_price)}
                            </option>
                          ))}
                        </select>
                      )}
                      {isMask && (
                        <select
                          value={chosenColor}
                          onChange={(e) => setCardColors(prev => new Map(prev).set(product.id, e.target.value))}
                          className={`w-full text-xs border rounded py-1 px-1.5 bg-white ${chosenColor ? 'border-gray-300 text-gray-900' : 'border-amber-400 text-gray-500'}`}
                          aria-label="Color"
                        >
                          <option value="" disabled>Choose color…</option>
                          {MASK_COLORS.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      )}
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setQty(qty - 1)}
                          className="w-6 h-6 flex items-center justify-center border border-gray-300 rounded text-gray-600 hover:bg-gray-50"
                          aria-label="Decrease quantity"
                        >−</button>
                        <span className="text-xs font-semibold tabular-nums text-gray-900 min-w-[1.5rem] text-center">{qty}</span>
                        <button
                          onClick={() => setQty(qty + 1)}
                          className="w-6 h-6 flex items-center justify-center border border-gray-300 rounded text-gray-600 hover:bg-gray-50"
                          aria-label="Increase quantity"
                        >+</button>
                      </div>
                      <button
                        onClick={() => addItem(selectedProduct.id, qty, isMask ? chosenColor : undefined)}
                        disabled={isMask && !chosenColor}
                        className="w-full text-xs bg-blue-600 text-white rounded py-1.5 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                      >
                        {isMask && !chosenColor ? 'Choose a color' : 'Add to Cart'}
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
