'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatCurrency } from '@/lib/utils';
import { calculateDiscount } from '@/lib/pricing';
import type { Product } from '@/lib/types';
import pb from '@/lib/pocketbase';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useCart } from '@/components/CartProvider';
import { useAuth } from '@/components/AuthProvider';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clearCart } = useCart();
  const [products, setProducts] = useState<Map<string, Product>>(new Map());
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'square' | 'invoice'>('square');
  const [discountCode, setDiscountCode] = useState('');
  const [codeStatus, setCodeStatus] = useState<'idle' | 'checking' | 'valid' | 'invalid' | 'used'>('idle');
  const [codeApplied, setCodeApplied] = useState(false);
  const [codePercent, setCodePercent] = useState(25);
  const { customer } = useAuth();

  const customerTier = customer?.discount_tier || 'auto';

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
      setLoading(false);
    }
    load();
  }, [items]);

  async function verifyCode() {
    if (!discountCode.trim()) return;
    setCodeStatus('checking');
    try {
      const res = await fetch(`/api/subscribe/verify?code=${encodeURIComponent(discountCode.trim())}`);
      const data = await res.json();
      if (data.valid && !data.used) {
        setCodeStatus('valid');
        setCodeApplied(true);
        setCodePercent(data.discount || 25);
      } else if (data.used) {
        setCodeStatus('used');
        setCodeApplied(false);
      } else {
        setCodeStatus('invalid');
        setCodeApplied(false);
      }
    } catch {
      setCodeStatus('invalid');
      setCodeApplied(false);
    }
  }

  function removeCode() {
    setDiscountCode('');
    setCodeStatus('idle');
    setCodeApplied(false);
    setCodePercent(25);
  }

  const subtotal = items.reduce((sum, item) => {
    const product = products.get(item.productId);
    return sum + (product ? product.retail_price * item.quantity : 0);
  }, 0);

  const tierDiscount = calculateDiscount(subtotal, customerTier as 'auto' | 'tier1' | 'tier2' | 'tier3');
  const codeDiscountAmount = codeApplied ? Math.round(subtotal * (codePercent / 100)) : 0;

  const useCode = codeApplied && codeDiscountAmount > tierDiscount.amount;
  const discount = useCode
    ? { percent: codePercent, amount: codeDiscountAmount, total: subtotal - codeDiscountAmount, tierName: `Discount Code (${codePercent}% off)` }
    : tierDiscount;

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
          ...(useCode ? { discountCode: discountCode.trim() } : {}),
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
                <span className="text-gray-900">{formatCurrency(product.retail_price * item.quantity)}</span>
              </div>
            );
          })}
          <div className="border-t pt-2 mt-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span className="text-gray-900">{formatCurrency(subtotal)}</span>
            </div>
            {discount.percent > 0 && (
              <div className="flex justify-between text-green-700">
                <span>Discount ({discount.percent}%)</span>
                <span>-{formatCurrency(discount.amount)}</span>
              </div>
            )}
            <div className="flex justify-between font-semibold text-lg mt-2 text-gray-900">
              <span>Total</span>
              <span>{formatCurrency(discount.total)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Discount code */}
      <div className="bg-white rounded-lg border p-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">Discount Code</h3>
        {codeApplied ? (
          <div className="flex items-center justify-between">
            <div>
              <span className="text-green-700 font-medium">{discountCode}</span>
              {useCode ? (
                <span className="text-green-600 text-sm ml-2">{codePercent}% off applied</span>
              ) : (
                <span className="text-gray-500 text-sm ml-2">(your wholesale discount is better)</span>
              )}
            </div>
            <button onClick={removeCode} className="text-sm text-red-600 hover:underline">Remove</button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="BD25-XXXXX"
              value={discountCode}
              onChange={(e) => { setDiscountCode(e.target.value.toUpperCase()); setCodeStatus('idle'); }}
              className="flex-1"
            />
            <Button
              onClick={verifyCode}
              disabled={!discountCode.trim() || codeStatus === 'checking'}
              variant="secondary"
              size="sm"
            >
              {codeStatus === 'checking' ? 'Checking...' : 'Apply'}
            </Button>
          </div>
        )}
        {codeStatus === 'invalid' && <p className="text-red-600 text-sm mt-2">Invalid discount code.</p>}
        {codeStatus === 'used' && <p className="text-red-600 text-sm mt-2">This code has already been used.</p>}
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
