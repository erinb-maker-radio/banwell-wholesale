'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import PageHeader from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import { Product, ProductCategory } from '@/lib/types';

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [shortTitle, setShortTitle] = useState('');
  const [category, setCategory] = useState('');
  const [retailPrice, setRetailPrice] = useState('');
  const [size, setSize] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [sortOrder, setSortOrder] = useState('0');

  useEffect(() => {
    fetchProduct();
    fetchCategories();
  }, [productId]);

  async function fetchProduct() {
    try {
      const res = await fetch(`/api/products/${productId}`);
      const json = await res.json();
      if (json.success && json.data) {
        const p = json.data as Product;
        setProduct(p);
        setTitle(p.title);
        setShortTitle(p.short_title);
        setCategory(p.category);
        setRetailPrice((p.retail_price / 100).toFixed(2));
        setSize(p.size || '');
        setImageUrl(p.image_url || '');
        setDescription(p.description || '');
        setIsActive(p.is_active);
        setSortOrder(String(p.sort_order));
      } else {
        setError(json.error || 'Failed to load product');
      }
    } catch (err) {
      setError('Failed to load product');
    } finally {
      setLoading(false);
    }
  }

  async function fetchCategories() {
    try {
      const res = await fetch('/api/public/categories');
      const json = await res.json();
      if (json.success && json.data) {
        setCategories(json.data);
      }
    } catch (err) {
      // Non-critical
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);

    try {
      const priceInCents = Math.round(parseFloat(retailPrice) * 100);

      const res = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          short_title: shortTitle,
          category,
          retail_price: priceInCents,
          size: size || undefined,
          image_url: imageUrl || undefined,
          description: description || undefined,
          is_active: isActive,
          sort_order: parseInt(sortOrder, 10) || 0,
        }),
      });

      const json = await res.json();
      if (json.success) {
        router.push('/admin/products');
      } else {
        setSaveError(json.error || 'Failed to save product');
      }
    } catch (err) {
      setSaveError('Failed to save product');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div>
        <PageHeader title="Edit Product" description="Loading..." />
        <Card>
          <CardContent className="py-12">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <PageHeader title="Edit Product" description="Error loading product" />
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => router.push('/admin/products')}>Back to Products</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const categoryOptions = categories.map((cat) => ({
    value: cat.id,
    label: cat.name,
  }));

  return (
    <div>
      <PageHeader
        title="Edit Product"
        description={product?.title || ''}
      />

      <Card>
        <CardHeader>
          <CardTitle>Product Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {saveError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {saveError}
              </div>
            )}

            {/* SKU (readonly) */}
            <Input
              id="sku"
              label="SKU"
              value={product?.sku || ''}
              disabled
            />

            {/* Title */}
            <Input
              id="title"
              label="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            {/* Short Title */}
            <Input
              id="short_title"
              label="Short Title"
              value={shortTitle}
              onChange={(e) => setShortTitle(e.target.value)}
              required
            />

            {/* Category */}
            <Select
              id="category"
              label="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              options={categoryOptions}
              placeholder="Select a category"
              required
            />

            {/* Retail Price */}
            <Input
              id="retail_price"
              label="Retail Price ($)"
              type="number"
              step="0.01"
              min="0"
              value={retailPrice}
              onChange={(e) => setRetailPrice(e.target.value)}
              required
            />

            {/* Size */}
            <Input
              id="size"
              label="Size"
              value={size}
              onChange={(e) => setSize(e.target.value)}
              placeholder="e.g. 6 inch, 8x10"
            />

            {/* Image URL */}
            <Input
              id="image_url"
              label="Image URL"
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
            />

            {/* Description */}
            <Textarea
              id="description"
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />

            {/* Sort Order */}
            <Input
              id="sort_order"
              label="Sort Order"
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            />

            {/* Is Active */}
            <div className="flex items-center space-x-3">
              <input
                id="is_active"
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                Active (visible in catalog)
              </label>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-3 pt-4 border-t border-gray-200">
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.push('/admin/products')}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
