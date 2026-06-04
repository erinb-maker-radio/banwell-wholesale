'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatCurrency, etsyImageHD } from '@/lib/utils';
import type { Product } from '@/lib/types';
import Button from '@/components/ui/Button';
import { useCart } from '@/components/CartProvider';
import { useAuth } from '@/components/AuthProvider';
import { MASK_COLORS, isMaskSlug } from '@/lib/colors';

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<{ id: string; product: Product }[]>([]);
  const [loading, setLoading] = useState(true);
  const [qtys, setQtys] = useState<Map<string, number>>(new Map());
  const [cardColors, setCardColors] = useState<Map<string, string>>(new Map());
  const [selectedSizes, setSelectedSizes] = useState<Map<string, string>>(new Map());
  const [sizeVariations, setSizeVariations] = useState<Map<string, Product[]>>(new Map());
  const { addItem } = useCart();
  const { customer, loading: authLoading } = useAuth();

  // Extract base design name (remove size info)
  const extractBaseName = (title: string): string => {
    return title
      .replace(/\s*\d+[""]\s*(ornament|suncatcher)?/gi, '')
      .replace(/\s*(ornament|suncatcher)\s*$/gi, '')
      .trim();
  };

  // Check if product is an ornament
  const isOrnament = (p: Product): boolean => {
    const title = (p.short_title || p.title).toLowerCase();
    const size = (p.size || '').toLowerCase();
    return title.includes('ornament') || size.includes('3"') || size.includes('3 inch');
  };

  useEffect(() => {
    if (authLoading) return;
    if (!customer) { setLoading(false); return; }

    fetch('/api/account/favorites')
      .then(res => res.json())
      .then(async data => {
        const favs = data.favorites || [];
        setFavorites(favs);

        // Load size variations for each favorite
        const variationsMap = new Map<string, Product[]>();
        const defaultSizes = new Map<string, string>();

        // Fetch all products to find variations
        const catalogRes = await fetch('/api/public/catalog?perPage=500');
        const catalogData = await catalogRes.json();
        const allProducts = catalogData.items || [];

        favs.forEach((fav: { id: string; product: Product }) => {
          const product = fav.product;
          const baseName = extractBaseName(product.short_title || product.title);
          const isCurrentOrnament = isOrnament(product);

          // Find all products with same base name and category
          const variations = allProducts.filter((p: Product) => {
            const pBaseName = extractBaseName(p.short_title || p.title);
            const pIsOrnament = isOrnament(p);
            return pBaseName === baseName &&
                   p.category === product.category &&
                   pIsOrnament === isCurrentOrnament;
          }).sort((a: Product, b: Product) => a.retail_price - b.retail_price);

          if (variations.length > 1) {
            variationsMap.set(product.id, variations);
          }
          defaultSizes.set(product.id, product.id);
        });

        setSizeVariations(variationsMap);
        setSelectedSizes(defaultSizes);
      })
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
          const variations = sizeVariations.get(product.id) || [];
          const selectedSizeId = selectedSizes.get(product.id) || product.id;
          const selectedProduct = variations.find(v => v.id === selectedSizeId) || product;
          const isMask = isMaskSlug(selectedProduct.expand?.category?.slug);
          const qty = qtys.get(product.id) || 1;
          const setQty = (n: number) => setQtys(prev => new Map(prev).set(product.id, Math.max(1, n)));
          const chosenColor = cardColors.get(product.id) || '';
          return (
          <div key={id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <Link href={`/product/${selectedProduct.id}`}>
              <div className="aspect-square bg-gray-100 overflow-hidden">
                {selectedProduct.image_url && <img src={etsyImageHD(selectedProduct.image_url)} alt={selectedProduct.short_title} className="w-full h-full object-cover" loading="lazy" />}
              </div>
            </Link>
            <div className="p-3">
              <p className="text-sm font-medium text-gray-900 line-clamp-2">{selectedProduct.short_title || selectedProduct.title}</p>
              <p className="text-sm font-semibold text-blue-600 mt-1">{formatCurrency(selectedProduct.retail_price)}</p>
              {variations.length > 1 && (
                <select
                  value={selectedSizeId}
                  onChange={(e) => {
                    setSelectedSizes(prev => new Map(prev).set(product.id, e.target.value));
                  }}
                  className="mt-2 w-full text-xs border border-gray-300 rounded py-1 px-1.5 bg-white text-gray-900"
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
                  className={`mt-2 w-full text-xs border rounded py-1 px-1.5 bg-white ${chosenColor ? 'border-gray-300 text-gray-900' : 'border-amber-400 text-gray-500'}`}
                  aria-label="Color"
                >
                  <option value="" disabled>Choose color…</option>
                  {MASK_COLORS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              )}
              <div className="flex items-center justify-center gap-1 mt-2">
                <button onClick={() => setQty(qty - 1)} className="w-6 h-6 flex items-center justify-center border border-gray-300 rounded text-gray-600 hover:bg-gray-50" aria-label="Decrease quantity">−</button>
                <span className="text-xs font-semibold tabular-nums text-gray-900 min-w-[1.5rem] text-center">{qty}</span>
                <button onClick={() => setQty(qty + 1)} className="w-6 h-6 flex items-center justify-center border border-gray-300 rounded text-gray-600 hover:bg-gray-50" aria-label="Increase quantity">+</button>
              </div>
              <div className="flex gap-1 mt-2">
                <button
                  onClick={() => addItem(selectedProduct.id, qty, isMask ? chosenColor : undefined)}
                  disabled={isMask && !chosenColor}
                  className="flex-1 text-xs bg-blue-600 text-white rounded py-1.5 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {isMask && !chosenColor ? 'Choose a color' : 'Add to Cart'}
                </button>
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
