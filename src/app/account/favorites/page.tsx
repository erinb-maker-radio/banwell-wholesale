'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatCurrency, etsyImageHD } from '@/lib/utils';
import type { Product } from '@/lib/types';
import Button from '@/components/ui/Button';
import { useCart } from '@/components/CartProvider';
import { useAuth } from '@/components/AuthProvider';
import { MASK_COLORS, isMaskSlug } from '@/lib/colors';

function extractBaseName(title: string): string {
  return title
    .replace(/\s*\d+[""]\s*(ornament|suncatcher)?/gi, '')
    .replace(/\s*(ornament|suncatcher)\s*$/gi, '')
    .trim();
}

function isOrnament(p: Product): boolean {
  const title = (p.short_title || p.title).toLowerCase();
  const size = (p.size || '').toLowerCase();
  return title.includes('ornament') || size.includes('3"') || size.includes('3 inch');
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<{ id: string; product: Product }[]>([]);
  const [loading, setLoading] = useState(true);
  const [qtys, setQtys] = useState<Map<string, number>>(new Map());
  const [cardColors, setCardColors] = useState<Map<string, string>>(new Map());
  const [selectedSizes, setSelectedSizes] = useState<Map<string, string>>(new Map());
  const [sizeVariations, setSizeVariations] = useState<Map<string, Product[]>>(new Map());
  const { addItem } = useCart();
  const { customer, loading: authLoading } = useAuth();

  useEffect(() => {
    if (authLoading) return;
    if (!customer) { setLoading(false); return; }

    async function load() {
      try {
        const [favRes, allRes] = await Promise.all([
          fetch('/api/account/favorites').then(r => r.json()),
          fetch('/api/public/catalog?all=1').then(r => r.json()),
        ]);

        const favs: { id: string; product: Product }[] = favRes.favorites || [];
        const allProducts: Product[] = allRes.items || [];

        const variationsMap = new Map<string, Product[]>();
        const defaultSizes = new Map<string, string>();

        favs.forEach(({ product }) => {
          const baseName = extractBaseName(product.short_title || product.title);
          const isOrn = isOrnament(product);
          const variants = allProducts
            .filter(p =>
              extractBaseName(p.short_title || p.title) === baseName &&
              p.category === product.category &&
              isOrnament(p) === isOrn
            )
            .sort((a, b) => a.retail_price - b.retail_price);

          if (variants.length > 1) variationsMap.set(product.id, variants);
          defaultSizes.set(product.id, product.id);
        });

        setFavorites(favs);
        setSizeVariations(variationsMap);
        setSelectedSizes(defaultSizes);
      } catch (err) {
        console.error('Favorites load error:', err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [customer, authLoading]);

  async function removeFavorite(favId: string, productId: string) {
    const res = await fetch('/api/account/favorites', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ favoriteId: favId }),
    });
    if (res.ok) setFavorites(prev => prev.filter(f => f.id !== favId));
    setSizeVariations(prev => { const m = new Map(prev); m.delete(productId); return m; });
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
        {favorites.map(({ id: favId, product }) => {
          const variations = sizeVariations.get(product.id) || [];
          const selectedId = selectedSizes.get(product.id) || product.id;
          const selectedProduct = variations.find(v => v.id === selectedId) || product;
          const isMask = isMaskSlug(selectedProduct.expand?.category?.slug);
          const qty = qtys.get(product.id) || 1;
          const chosenColor = cardColors.get(product.id) || '';

          return (
            <div key={favId} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group relative">
              <Link href={`/product/${selectedProduct.id}`}>
                <div className="aspect-square bg-gray-100 overflow-hidden">
                  {selectedProduct.image_url && (
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
                    {extractBaseName(selectedProduct.short_title || selectedProduct.title)}
                  </p>
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
                    <p className="text-sm font-semibold text-blue-600 mt-1">{formatCurrency(selectedProduct.retail_price)}</p>
                  )}
                </div>
              </Link>

              <div className="px-3 pb-3 space-y-1.5">
                {variations.length > 1 && (
                  <select
                    value={selectedId}
                    onChange={e => setSelectedSizes(prev => new Map(prev).set(product.id, e.target.value))}
                    className="w-full text-xs border border-gray-300 rounded py-1 px-1.5 bg-white text-gray-900"
                    aria-label="Size"
                  >
                    {variations.map(v => (
                      <option key={v.id} value={v.id}>
                        {v.size || v.short_title} — {formatCurrency(v.retail_price)}
                      </option>
                    ))}
                  </select>
                )}
                {isMask && (
                  <select
                    value={chosenColor}
                    onChange={e => setCardColors(prev => new Map(prev).set(product.id, e.target.value))}
                    className={`w-full text-xs border rounded py-1 px-1.5 bg-white ${chosenColor ? 'border-gray-300 text-gray-900' : 'border-amber-400 text-gray-500'}`}
                    aria-label="Color"
                  >
                    <option value="" disabled>Choose color…</option>
                    {MASK_COLORS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                )}
                <div className="flex items-center justify-center gap-1">
                  <button onClick={() => setQtys(prev => new Map(prev).set(product.id, Math.max(1, qty - 1)))} className="w-6 h-6 flex items-center justify-center border border-gray-300 rounded text-gray-600 hover:bg-gray-50" aria-label="Decrease">−</button>
                  <span className="text-xs font-semibold tabular-nums text-gray-900 min-w-[1.5rem] text-center">{qty}</span>
                  <button onClick={() => setQtys(prev => new Map(prev).set(product.id, qty + 1))} className="w-6 h-6 flex items-center justify-center border border-gray-300 rounded text-gray-600 hover:bg-gray-50" aria-label="Increase">+</button>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => addItem(selectedProduct.id, qty, isMask ? chosenColor : undefined)}
                    disabled={isMask && !chosenColor}
                    className="flex-1 text-xs bg-blue-600 text-white rounded py-1.5 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    {isMask && !chosenColor ? 'Choose a color' : 'Add to Cart'}
                  </button>
                  <button onClick={() => removeFavorite(favId, product.id)} className="text-xs border rounded px-2 py-1.5 text-red-600 hover:bg-red-50">✕</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
