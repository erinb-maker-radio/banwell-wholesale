'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { formatCurrency, formatDate, formatOrderStatus, getStatusColor } from '@/lib/utils';
import type { Order, OrderItem, Product } from '@/lib/types';
import pb from '@/lib/pocketbase';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { useCart } from '@/components/CartProvider';

export default function OrderDetailPage() {
  const params = useParams();
  const { addItem } = useCart();
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<(OrderItem & { productData?: Product })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const orderRecord = await pb.collection('orders').getOne(params.id as string);
        setOrder(orderRecord as unknown as Order);

        const orderItems = await pb.collection('order_items').getFullList({
          filter: `order="${params.id}"`,
          expand: 'product',
        });
        setItems(orderItems.map(oi => ({
          ...(oi as unknown as OrderItem),
          productData: oi.expand?.product as unknown as Product,
        })));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params.id]);

  function handleReorder() {
    for (const item of items) {
      if (item.productData) {
        addItem(item.product, item.quantity);
      }
    }
    window.location.href = '/account/cart';
  }

  if (loading) return <div className="text-center py-12 text-gray-500">Loading...</div>;
  if (!order) return <div className="text-center py-12 text-gray-500">Order not found</div>;

  return (
    <div className="max-w-3xl">
      <div className="mb-2">
        <Link href="/account/orders" className="text-sm text-blue-600 hover:underline">&larr; All Orders</Link>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{order.order_number}</h2>
          <p className="text-sm text-gray-500">Placed {formatDate(order.created)}</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="status" status={order.status}>{formatOrderStatus(order.status)}</Badge>
          <Button variant="secondary" size="sm" onClick={handleReorder}>Reorder</Button>
        </div>
      </div>

      {/* Status timeline */}
      <div className="bg-white rounded-lg border p-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">Order Status</h3>
        <div className="space-y-2 text-sm">
          {order.tracking_number && (
            <p><strong>Tracking:</strong> {order.tracking_number}</p>
          )}
          {order.shipped_date && (
            <p><strong>Shipped:</strong> {formatDate(order.shipped_date)}</p>
          )}
          {order.delivered_date && (
            <p><strong>Delivered:</strong> {formatDate(order.delivered_date)}</p>
          )}
          <p><strong>Payment:</strong> {order.payment_method === 'square' ? 'Credit Card (Square)' : 'Invoice'}</p>
        </div>
      </div>

      {/* Items */}
      <div className="bg-white rounded-lg border overflow-hidden mb-6">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-6 py-3 font-medium text-gray-500">Product</th>
              <th className="text-center px-6 py-3 font-medium text-gray-500">Qty</th>
              <th className="text-right px-6 py-3 font-medium text-gray-500">Unit Price</th>
              <th className="text-right px-6 py-3 font-medium text-gray-500">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {items.map(item => (
              <tr key={item.id}>
                <td className="px-6 py-3">
                  <p className="font-medium">{item.productData?.short_title || item.productData?.title || 'Product'}</p>
                  <p className="text-xs text-gray-400">{item.productData?.sku}</p>
                </td>
                <td className="px-6 py-3 text-center">{item.quantity}</td>
                <td className="px-6 py-3 text-right">{formatCurrency(item.unit_price)}</td>
                <td className="px-6 py-3 text-right">{formatCurrency(item.line_total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="bg-white rounded-lg border p-6">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Subtotal</span>
            <span>{formatCurrency(order.subtotal)}</span>
          </div>
          {order.discount_percent > 0 && (
            <div className="flex justify-between text-green-700">
              <span>Discount ({order.discount_percent}%)</span>
              <span>-{formatCurrency(order.discount_amount)}</span>
            </div>
          )}
          <div className="flex justify-between font-semibold text-lg border-t pt-2">
            <span>Total</span>
            <span>{formatCurrency(order.total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
