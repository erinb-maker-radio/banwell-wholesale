'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatCurrency, formatDate, formatOrderStatus, getStatusColor } from '@/lib/utils';
import type { Order, OrderStatus } from '@/lib/types';
import PageHeader from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

const STATUS_FILTERS: { label: string; value: OrderStatus | '' }[] = [
  { label: 'All', value: '' },
  { label: 'Pending Payment', value: 'pending_payment' },
  { label: 'Payment Received', value: 'payment_received' },
  { label: 'Being Fulfilled', value: 'being_fulfilled' },
  { label: 'Shipped', value: 'shipped' },
  { label: 'Delivered', value: 'delivered' },
  { label: 'Follow Up', value: 'follow_up' },
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeStatus, setActiveStatus] = useState<OrderStatus | ''>('');

  useEffect(() => {
    fetchOrders(activeStatus);
  }, [activeStatus]);

  async function fetchOrders(status: OrderStatus | '') {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (status) params.set('status', status);
      params.set('perPage', '100');

      const res = await fetch(`/api/orders?${params.toString()}`);
      const json = await res.json();

      if (json.success) {
        setOrders(json.items || []);
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  }

  function getItemCount(order: Order): number {
    return order.expand?.order_items_via_order?.length || 0;
  }

  return (
    <div>
      <PageHeader
        title="Orders"
        description="Manage wholesale orders"
      />

      {/* Status filter buttons */}
      <div className="flex flex-wrap gap-2 mb-6">
        {STATUS_FILTERS.map((filter) => (
          <Button
            key={filter.value}
            variant={activeStatus === filter.value ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setActiveStatus(filter.value)}
          >
            {filter.label}
          </Button>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-12 text-gray-500">Loading orders...</div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">
                {activeStatus
                  ? `No orders with status "${formatOrderStatus(activeStatus)}"`
                  : 'No orders found'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-6 py-3 font-medium text-gray-500">Order #</th>
                    <th className="text-left px-6 py-3 font-medium text-gray-500">Customer</th>
                    <th className="text-left px-6 py-3 font-medium text-gray-500">Status</th>
                    <th className="text-left px-6 py-3 font-medium text-gray-500">Payment</th>
                    <th className="text-center px-6 py-3 font-medium text-gray-500">Items</th>
                    <th className="text-right px-6 py-3 font-medium text-gray-500">Total</th>
                    <th className="text-left px-6 py-3 font-medium text-gray-500">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="text-blue-600 hover:underline font-medium"
                        >
                          {order.order_number}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-gray-900">
                        {order.expand?.customer?.business_name || 'Unknown'}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="status" status={order.status}>
                          {formatOrderStatus(order.status)}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {order.payment_method === 'square' ? 'Credit Card' : 'Invoice'}
                      </td>
                      <td className="px-6 py-4 text-center text-gray-600">
                        {getItemCount(order)}
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-gray-900">
                        {formatCurrency(order.total)}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {formatDate(order.created)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
