'use client';

import { useEffect, useState, useMemo } from 'react';
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

const PAGE_SIZE = 48;

export default function MyCatalogPage() {
  const [loading, setLoading] = useState(true);
  const [designCards, setDesignCards] = useState<Product[]>([]);
  const [sizeVariations, setSizeVariations] = useState<Map<string, Product[]>>(new Map());
  const [selectedSizes, setSelectedSizes] = useState<Map<string, string>>(new Map());
  const [cardColors, setCardColors] = useState<Map<string, string>>(new Map());
  const [cardQtys, setCardQtys] = useState<Map<string, number>>(new Map());
  const [page, setPage] = useState(1);
  const { addItem } = useCart();
  const { customer, loading: authLoading } = useAuth();

  useEffect(() => {
    if (authLoading || !customer) { setLoading(false); return; }

    async function load() {
      try {
        // 1. Curated design representatives
        const curatedRes = await fetch('/api/account/curated');
        const curatedData = await curatedRes.json();
        const curatedProducts: Product[] = curatedData.products || [];
        if (curatedProducts.length === 0) { setLoading(false); return; }

        type DesignKey = string;
        const approvedKeys = new Set<DesignKey>();
        curatedProducts.forEach(p => {
          const key = `${extractBaseName(p.short_title || p.title)}||${p.category}||${isOrnament(p)}`;
          approvedKeys.add(key);
        });

        // 2. Fetch all active products in one shot
        const allRes = await fetch('/api/public/catalog?all=1');
        const allData = await allRes.json();
        const allProducts: Product[] = allData.items || [];

        // 3. Filter to approved designs only
        const filtered = allProducts.filter(p => {
          const key = `${extractBaseName(p.short_title || p.title)}||${p.category}||${isOrnament(p)}`;
          return approvedKeys.has(key);
        });

        // 4. Group into design cards (cheapest = representative)
        const uniqueDesigns = new Map<string, Product>();
        filtered.forEach(p => {
          const key = `${extractBaseName(p.short_title || p.title)}||${p.category}||${isOrnament(p)}`;
          const existing = uniqueDesigns.get(key);
          if (!existing || p.retail_price < existing.retail_price) {
            uniqueDesigns.set(key, p);
          }
        });

        const cards = Array.from(uniqueDesigns.values());
        const variationsMap = new Map<string, Product[]>();
        cards.forEach(rep => {
          const key = `${extractBaseName(rep.short_title || rep.title)}||${rep.category}||${isOrnament(rep)}`;
          const variants = filtered
            .filter(p => `${extractBaseName(p.short_title || p.title)}||${p.category}||${isOrnament(p)}` === key)
            .sort((a, b) => a.retail_price - b.retail_price);
          if (variants.length > 1) variationsMap.set(rep.id, variants);
        });

        const defaultSizes = new Map<string, string>();
        cards.forEach(p => defaultSizes.set(p.id, p.id));

        setDesignCards(cards);
        setSizeVariations(variationsMap);
        setSelectedSizes(defaultSizes);
      } catch (err) {
        console.error('My Catalog load error:', err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [customer, authLoading]);

  const totalPages = Math.ceil(designCards.length / PAGE_SIZE);
  const pageCards = useMemo(
    () => designCards.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [designCards, page]
  );

  if (loading || authLoading) return <div className="text-center py-12 text-gray-500">Loading your catalog...</div>;

  if (designCards.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Your personalized catalog is being prepared</h2>
        <p className="text-gray-500 mb-6">We&apos;ll curate a selection of products for you. In the meantime, browse our full catalog.</p>
        <Link href="/catalog"><Button>Browse Full Catalog</Button></Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">
          My Catalog <span className="text-sm font-normal text-gray-500">({designCards.length} designs)</span>
        </h2>
        <Link href="/catalog" className="text-sm text-blue-600 hover:underline">Browse Full Catalog &rarr;</Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {pageCards.map(rep => {
          const variations = sizeVariations.get(rep.id) || [];
          const selectedId = selectedSizes.get(rep.id) || rep.id;
          const selectedProduct = variations.find(v => v.id === selectedId) || rep;
          const isMask = isMaskSlug(selectedProduct.expand?.category?.slug);
          const chosenColor = cardColors.get(rep.id) || '';
          const qty = cardQtys.get(rep.id) || 1;

          return (
            <div key={rep.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group relative">
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
                  <p className="text-xs text-gray-400 mt-0.5">{rep.sku?.replace(/-6$/, '') || ''}</p>
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
                    onChange={e => setSelectedSizes(prev => new Map(prev).set(rep.id, e.target.value))}
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
                    onChange={e => setCardColors(prev => new Map(prev).set(rep.id, e.target.value))}
                    className={`w-full text-xs border rounded py-1 px-1.5 bg-white ${chosenColor ? 'border-gray-300 text-gray-900' : 'border-amber-400 text-gray-500'}`}
                    aria-label="Color"
                  >
                    <option value="" disabled>Choose color…</option>
                    {MASK_COLORS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                )}
                <div className="flex items-center justify-center gap-1">
                  <button onClick={() => setCardQtys(prev => new Map(prev).set(rep.id, Math.max(1, qty - 1)))} className="w-6 h-6 flex items-center justify-center border border-gray-300 rounded text-gray-600 hover:bg-gray-50" aria-label="Decrease">−</button>
                  <span className="text-xs font-semibold tabular-nums text-gray-900 min-w-[1.5rem] text-center">{qty}</span>
                  <button onClick={() => setCardQtys(prev => new Map(prev).set(rep.id, qty + 1))} className="w-6 h-6 flex items-center justify-center border border-gray-300 rounded text-gray-600 hover:bg-gray-50" aria-label="Increase">+</button>
                </div>
                <button
                  onClick={() => addItem(selectedProduct.id, qty, isMask ? chosenColor : undefined)}
                  disabled={isMask && !chosenColor}
                  className="w-full text-xs bg-blue-600 text-white rounded py-1.5 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {isMask && !chosenColor ? 'Choose a color' : 'Add to Cart'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 text-sm border rounded disabled:opacity-40 hover:bg-gray-50">← Prev</button>
          <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1.5 text-sm border rounded disabled:opacity-40 hover:bg-gray-50">Next →</button>
        </div>
      )}
    </div>
  );
}
