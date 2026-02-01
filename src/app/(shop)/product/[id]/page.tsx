'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';
import type { Product, ProductCategory } from '@/lib/types';
import pb from '@/lib/pocketbase';
import Button from '@/components/ui/Button';

export default function ProductDetailPage() {
  const params = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [category, setCategory] = useState<ProductCategory | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    pb.collection('products').getOne(params.id as string, { expand: 'category' })
      .then(record => {
        const p = record as unknown as Product;
        setProduct(p);
        if (p.expand?.category) {
          setCategory(p.expand.category);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [params.id]);

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
              src={product.image_url}
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

          <div className="mt-8 space-y-3">
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
          </div>
        </div>
      </div>
    </div>
  );
}
