'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatCurrency, formatDate, formatOrderStatus, getStatusColor } from '@/lib/utils';
import type { Order } from '@/lib/types';
import pb from '@/lib/pocketbase';
import Badge from '@/components/ui/Badge';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const customerId = pb.authStore.record?.id;
    if (!customerId) return;

    pb.collection('orders').getFullList({
      filter: `customer="${customerId}"`,
      sort: '-created',
    })
      .then(records => setOrders(records as unknown as Order[]))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-12 text-gray-500">Loading orders...</div>;

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">No orders yet</h2>
        <p className="text-gray-500 mb-6">Start browsing our catalog to place your first order.</p>
        <Link href="/catalog" className="text-blue-600 hover:underline">Browse Catalog</Link>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-6">Order History</h2>
      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-6 py-3 font-medium text-gray-500">Order</th>
              <th className="text-left px-6 py-3 font-medium text-gray-500">Date</th>
              <th className="text-left px-6 py-3 font-medium text-gray-500">Status</th>
              <th className="text-right px-6 py-3 font-medium text-gray-500">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {orders.map(order => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <Link href={`/account/orders/${order.id}`} className="text-blue-600 hover:underline font-medium">
                    {order.order_number}
                  </Link>
                </td>
                <td className="px-6 py-4 text-gray-600">{formatDate(order.created)}</td>
                <td className="px-6 py-4">
                  <Badge variant="status" status={order.status}>
                    {formatOrderStatus(order.status)}
                  </Badge>
                </td>
                <td className="px-6 py-4 text-right font-medium">{formatCurrency(order.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
