'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatCurrency } from '@/lib/utils';
import { calculateDiscount } from '@/lib/pricing';
import type { Product } from '@/lib/types';
import pb from '@/lib/pocketbase';
import Button from '@/components/ui/Button';
import { useCart } from '@/components/CartProvider';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clearCart } = useCart();
  const [products, setProducts] = useState<Map<string, Product>>(new Map());
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'square' | 'invoice'>('square');
  const [customerTier, setCustomerTier] = useState<string>('auto');

  useEffect(() => {
    async function load() {
      if (items.length === 0) { setLoading(false); return; }
      const productMap = new Map<string, Product>();
      for (const item of items) {
        try {
          const record = await pb.collection('products').getOne(item.productId);
          productMap.set(item.productId, record as unknown as Product);
        } catch { /* skip */ }
      }
      setProducts(productMap);
      try {
        const customer = pb.authStore.record;
        if (customer?.discount_tier) setCustomerTier(customer.discount_tier);
      } catch { /* ignore */ }
      setLoading(false);
    }
    load();
  }, [items]);

  const subtotal = items.reduce((sum, item) => {
    const product = products.get(item.productId);
    return sum + (product ? product.retail_price * item.quantity : 0);
  }, 0);

  const discount = calculateDiscount(subtotal, customerTier as 'auto' | 'tier1' | 'tier2' | 'tier3');

  async function handleCheckout() {
    setSubmitting(true);
    setError('');

    const endpoint = paymentMethod === 'square'
      ? '/api/shop/checkout/pay-now'
      : '/api/shop/checkout/request-invoice';

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(i => ({
            productId: i.productId,
            quantity: i.quantity,
          })),
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        setError(result.error || 'Checkout failed');
        setSubmitting(false);
        return;
      }

      clearCart();

      if (paymentMethod === 'square' && result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
      } else {
        router.push(`/account/checkout/thank-you?order=${result.orderNumber}`);
      }
    } catch {
      setError('Network error. Please try again.');
      setSubmitting(false);
    }
  }

  if (loading) return <div className="text-center py-12 text-gray-500">Loading...</div>;
  if (items.length === 0) {
    router.push('/account/cart');
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Checkout</h2>

      {error && <div className="bg-red-50 text-red-700 text-sm p-4 rounded-lg mb-6">{error}</div>}

      {/* Order summary */}
      <div className="bg-white rounded-lg border p-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">Order Summary</h3>
        <div className="space-y-2 text-sm">
          {items.map(item => {
            const product = products.get(item.productId);
            if (!product) return null;
            return (
              <div key={item.productId} className="flex justify-between">
                <span className="text-gray-600">{product.short_title || product.title} x{item.quantity}</span>
                <span>{formatCurrency(product.retail_price * item.quantity)}</span>
              </div>
            );
          })}
          <div className="border-t pt-2 mt-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            {discount.percent > 0 && (
              <div className="flex justify-between text-green-700">
                <span>Discount ({discount.percent}%)</span>
                <span>-{formatCurrency(discount.amount)}</span>
              </div>
            )}
            <div className="flex justify-between font-semibold text-lg mt-2">
              <span>Total</span>
              <span>{formatCurrency(discount.total)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment method */}
      <div className="bg-white rounded-lg border p-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">Payment Method</h3>
        <div className="space-y-3">
          <label className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-gray-50">
            <input
              type="radio"
              name="payment"
              value="square"
              checked={paymentMethod === 'square'}
              onChange={() => setPaymentMethod('square')}
              className="text-blue-600"
            />
            <div>
              <p className="font-medium text-gray-900">Pay Now (Credit Card)</p>
              <p className="text-sm text-gray-500">Secure payment via Square</p>
            </div>
          </label>
          <label className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-gray-50">
            <input
              type="radio"
              name="payment"
              value="invoice"
              checked={paymentMethod === 'invoice'}
              onChange={() => setPaymentMethod('invoice')}
              className="text-blue-600"
            />
            <div>
              <p className="font-medium text-gray-900">Request Invoice</p>
              <p className="text-sm text-gray-500">Net 30 payment terms</p>
            </div>
          </label>
        </div>
      </div>

      <Button onClick={handleCheckout} disabled={submitting} className="w-full" size="lg">
        {submitting ? 'Processing...' : paymentMethod === 'square' ? 'Pay Now' : 'Place Order (Invoice)'}
      </Button>
    </div>
  );
}
