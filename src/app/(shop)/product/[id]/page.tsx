'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { formatCurrency, etsyImageHD } from '@/lib/utils';
import type { Product, ProductCategory } from '@/lib/types';
import pb from '@/lib/pocketbase';
import Button from '@/components/ui/Button';
import { useAuth } from '@/components/AuthProvider';
import { useCart } from '@/components/CartProvider';
import { MASK_COLORS, COLOR_HEX, isMaskSlug } from '@/lib/colors';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [category, setCategory] = useState<ProductCategory | null>(null);
  const [sizeVariations, setSizeVariations] = useState<Product[]>([]);
  const [selectedVariation, setSelectedVariation] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [addedToCart, setAddedToCart] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const { customer, loading: authLoading } = useAuth();
  const { addItem } = useCart();

  const isMask = isMaskSlug(category?.slug);

  useEffect(() => {
    pb.collection('products').getOne(params.id as string, { expand: 'category' })
      .then(async record => {
        const p = record as unknown as Product;
        setProduct(p);
        if (p.expand?.category) {
          setCategory(p.expand.category);
        }

        // Load size variations (products with same base design name)
        const baseName = extractBaseName(p.short_title || p.title);
        if (baseName) {
          try {
            const variations = await pb.collection('products').getFullList({
              filter: `category="${p.category}" && is_active=true`,
              sort: 'retail_price',
            });
            // Filter to products with matching base name
            const matching = (variations as unknown as Product[]).filter(v => {
              const vBase = extractBaseName(v.short_title || v.title);
              return vBase === baseName;
            });

            // Separate ornaments (3") from suncatchers (larger sizes)
            const isCurrentOrnament = isOrnament(p);
            const filtered = matching.filter(v => {
              const vIsOrnament = isOrnament(v);
              // If current is ornament, show only ornament
              // If current is suncatcher, show only suncatchers
              return vIsOrnament === isCurrentOrnament;
            });

            if (filtered.length > 0) {
              setSizeVariations(filtered);
              setSelectedVariation(p.id);
            }
          } catch (err) {
            console.error('Failed to load size variations:', err);
          }
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [params.id]);

  // Extract base design name (remove size info like "6\"", "10\"", "ornament", "suncatcher")
  function extractBaseName(title: string): string {
    return title
      .replace(/\s*\d+[""]\s*(ornament|suncatcher)?/gi, '')
      .replace(/\s*(ornament|suncatcher)\s*$/gi, '')
      .trim();
  }

  // Check if product is an ornament (3" size)
  function isOrnament(p: Product): boolean {
    const title = (p.short_title || p.title).toLowerCase();
    const size = (p.size || '').toLowerCase();
    return title.includes('ornament') || size.includes('3"') || size.includes('3 inch');
  }

  // Find the ornament or suncatcher counterpart
  function findCounterpart(isCurrentOrnament: boolean): Product | null {
    if (!product) return null;
    const baseName = extractBaseName(product.short_title || product.title);

    // Search in all loaded variations or do a new query
    const allVariations = async () => {
      try {
        const variations = await pb.collection('products').getFullList({
          filter: `category="${product.category}" && is_active=true`,
          sort: 'retail_price',
        });
        const matching = (variations as unknown as Product[]).filter(v => {
          const vBase = extractBaseName(v.short_title || v.title);
          const vIsOrnament = isOrnament(v);
          return vBase === baseName && vIsOrnament !== isCurrentOrnament;
        });
        return matching[0] || null;
      } catch {
        return null;
      }
    };
    return null; // Will use useEffect to set this
  }

  const [ornamentLink, setOrnamentLink] = useState<Product | null>(null);
  const [suncatcherLink, setSuncatcherLink] = useState<Product | null>(null);

  useEffect(() => {
    if (!product) return;
    const baseName = extractBaseName(product.short_title || product.title);
    const isCurrentOrnament = isOrnament(product);

    // Find counterpart link
    pb.collection('products').getFullList({
      filter: `category="${product.category}" && is_active=true`,
      sort: 'retail_price',
    }).then(variations => {
      const matching = (variations as unknown as Product[]).filter(v => {
        const vBase = extractBaseName(v.short_title || v.title);
        const vIsOrnament = isOrnament(v);
        return vBase === baseName && vIsOrnament !== isCurrentOrnament;
      });

      if (isCurrentOrnament) {
        setSuncatcherLink(matching[0] || null);
        setOrnamentLink(null);
      } else {
        setOrnamentLink(matching[0] || null);
        setSuncatcherLink(null);
      }
    }).catch(console.error);
  }, [product]);

  // Switch to different size variation
  function handleSizeChange(variationId: string) {
    const variation = sizeVariations.find(v => v.id === variationId);
    if (variation) {
      setSelectedVariation(variationId);
      setProduct(variation);
      // Update URL without reloading
      window.history.replaceState(null, '', `/product/${variationId}`);
    }
  }

  function handleAddToCart() {
    if (!product) return;
    if (isMask && !selectedColor) return; // masks require a color
    // Go through CartProvider so the live cart sidebar updates immediately
    addItem(product.id, quantity, isMask ? selectedColor : undefined);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  }

  if (loading) return <div className="max-w-7xl mx-auto px-4 py-12 text-center text-gray-500">Loading...</div>;
  if (!product) return <div className="max-w-7xl mx-auto px-4 py-12 text-center text-gray-500">Product not found</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-4">
        <Link href="/catalog" className="text-sm text-blue-600 hover:underline">&larr; Back to Catalog</Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Image */}
        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
          {product.image_url && (
            <img
              src={etsyImageHD(product.image_url, 'full')}
              alt={product.title}
              className="w-full h-full object-cover"
            />
          )}
        </div>

        {/* Details */}
        <div>
          <p className="text-sm text-gray-500">{product.sku}</p>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">{product.title}</h1>

          {category && (
            <Link
              href={`/catalog/${category.slug}`}
              className="text-sm text-blue-600 hover:underline mt-2 inline-block"
            >
              {category.name}
            </Link>
          )}

          {product.size && (
            <p className="text-sm text-gray-600 mt-2">Size: {product.size}</p>
          )}

          {sizeVariations.length > 0 && (
            <div className="mt-6">
              <p className="text-sm font-medium text-gray-900 mb-2">
                {isOrnament(product) ? 'Ornament Size' : 'Available Suncatcher Sizes'}:
              </p>
              <div className="space-y-2">
                {sizeVariations.map(variation => (
                  <button
                    key={variation.id}
                    onClick={() => handleSizeChange(variation.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg border-2 transition ${
                      selectedVariation === variation.id
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-gray-900">{variation.size || variation.short_title}</p>
                        <p className="text-xs text-gray-500">{variation.sku}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900">{formatCurrency(variation.retail_price)}</p>
                        <p className="text-xs text-gray-500">retail</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {ornamentLink && (
                <div className="mt-3 text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                  Looking for the 3" ornament version?{' '}
                  <Link href={`/product/${ornamentLink.id}`} className="text-blue-600 hover:underline font-medium">
                    View ornament listing →
                  </Link>
                </div>
              )}

              {suncatcherLink && (
                <div className="mt-3 text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                  Looking for larger suncatcher sizes?{' '}
                  <Link href={`/product/${suncatcherLink.id}`} className="text-blue-600 hover:underline font-medium">
                    View suncatcher sizes →
                  </Link>
                </div>
              )}
            </div>
          )}

          <div className="mt-6">
            <p className="text-sm text-gray-500">Retail Price</p>
            <p className="text-3xl font-bold text-gray-900">{formatCurrency(product.retail_price)}</p>
          </div>

          <div className="mt-4 bg-blue-50 rounded-lg p-4">
            <p className="text-sm font-medium text-blue-900">Wholesale Pricing</p>
            <div className="mt-2 space-y-1 text-sm text-blue-800">
              <p>40% off at $400+ order total = <strong>{formatCurrency(Math.round(product.retail_price * 0.6))}</strong></p>
              <p>50% off at $800+ order total = <strong>{formatCurrency(Math.round(product.retail_price * 0.5))}</strong></p>
              <p>55% off at $1,200+ order total = <strong>{formatCurrency(Math.round(product.retail_price * 0.45))}</strong></p>
            </div>
          </div>

          {product.description && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-900">Description</h3>
              <p className="text-sm text-gray-600 mt-1">{product.description}</p>
            </div>
          )}

          {isMask && (
            <div className="mt-6">
              <p className="text-sm font-medium text-gray-900 mb-2">
                Color: <span className="font-normal text-gray-600">{selectedColor || <span className="text-amber-600">Choose a color</span>}</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {MASK_COLORS.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setSelectedColor(c)}
                    title={c}
                    aria-label={c}
                    aria-pressed={selectedColor === c}
                    className={`w-8 h-8 rounded-full border transition ${selectedColor === c ? 'ring-2 ring-offset-2 ring-blue-600 border-gray-400' : 'border-gray-300 hover:border-gray-400'}`}
                    style={{ backgroundColor: COLOR_HEX[c] }}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 space-y-3">
            {!authLoading && customer ? (
              <>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-700">Quantity</span>
                  <div className="inline-flex items-center border border-gray-300 rounded-lg">
                    <button
                      type="button"
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      className="px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-l-lg"
                      aria-label="Decrease quantity"
                    >−</button>
                    <span className="px-4 text-base font-semibold tabular-nums text-gray-900 min-w-[2.5rem] text-center">{quantity}</span>
                    <button
                      type="button"
                      onClick={() => setQuantity(q => q + 1)}
                      className="px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-r-lg"
                      aria-label="Increase quantity"
                    >+</button>
                  </div>
                </div>
                <Button size="lg" className="w-full" onClick={handleAddToCart} disabled={isMask && !selectedColor}>
                  {addedToCart ? 'Added!' : (isMask && !selectedColor) ? 'Choose a color first' : 'Add to Cart'}
                </Button>
                <p className="text-center text-sm text-gray-500">
                  <Link href="/account/cart" className="text-blue-600 hover:underline">
                    View Cart
                  </Link>
                  {' | '}
                  <Link href="/account" className="text-blue-600 hover:underline">
                    My Account
                  </Link>
                </p>
              </>
            ) : !authLoading ? (
              <>
                <Link href="/login">
                  <Button size="lg" className="w-full">
                    Sign In to Order
                  </Button>
                </Link>
                <p className="text-center text-sm text-gray-500">
                  <Link href="/register" className="text-blue-600 hover:underline">
                    Create a wholesale account
                  </Link>
                  {' '}to start ordering
                </p>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
