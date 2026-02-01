'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { formatCurrency, formatDate, formatOrderStatus, getStatusColor } from '@/lib/utils';
import { getFileUrl } from '@/lib/pocketbase';
import type { Order, OrderItem, Customer, Communication, OrderStatus } from '@/lib/types';
import PageHeader from '@/components/layout/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';

const ORDER_STATUSES: OrderStatus[] = [
  'pending_payment',
  'payment_received',
  'being_fulfilled',
  'shipped',
  'delivered',
  'follow_up',
];

const WORKFLOW_ACTIONS: Record<OrderStatus, { label: string; nextStatus: OrderStatus; needsTracking?: boolean }> = {
  pending_payment: { label: 'Mark Payment Received', nextStatus: 'payment_received' },
  payment_received: { label: 'Start Fulfilling', nextStatus: 'being_fulfilled' },
  being_fulfilled: { label: 'Mark Shipped', nextStatus: 'shipped', needsTracking: true },
  shipped: { label: 'Mark Delivered', nextStatus: 'delivered' },
  delivered: { label: 'Send Follow-up', nextStatus: 'follow_up' },
  follow_up: { label: '', nextStatus: 'follow_up' },
};

export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Tracking number input for shipped transition
  const [showTrackingInput, setShowTrackingInput] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');

  // Add note form
  const [noteSubject, setNoteSubject] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteSaving, setNoteSaving] = useState(false);

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  useEffect(() => {
    if (order?.customer) {
      loadCommunications(order.customer);
    }
  }, [order?.customer]);

  async function loadOrder() {
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderId}`);
      const json = await res.json();
      if (json.success && json.data) {
        const orderData = json.data.order as Order;
        const itemsData = json.data.items as OrderItem[];
        setOrder(orderData);
        setItems(itemsData);
      }
    } catch (err) {
      console.error('Failed to load order:', err);
    } finally {
      setLoading(false);
    }
  }

  async function loadCommunications(customerId: string) {
    try {
      const res = await fetch(`/api/communications?customer=${customerId}&perPage=50`);
      const json = await res.json();
      if (json.success) {
        setCommunications(json.items || []);
      }
    } catch (err) {
      console.error('Failed to load communications:', err);
    }
  }

  async function handleWorkflowAction(nextStatus: OrderStatus) {
    if (!order) return;

    // If transitioning to shipped and tracking input not yet shown, show it
    if (nextStatus === 'shipped' && !showTrackingInput) {
      setShowTrackingInput(true);
      return;
    }

    setActionLoading(true);
    try {
      const body: Record<string, unknown> = { status: nextStatus };

      if (nextStatus === 'shipped' && trackingNumber.trim()) {
        body.tracking_number = trackingNumber.trim();
      }

      const res = await fetch(`/api/orders/${orderId}/workflow`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const json = await res.json();
      if (json.success) {
        setShowTrackingInput(false);
        setTrackingNumber('');
        await loadOrder();
        if (order?.customer) {
          await loadCommunications(order.customer);
        }
      } else {
        alert(json.error || 'Failed to update workflow');
      }
    } catch (err) {
      console.error('Workflow update failed:', err);
      alert('Failed to update order status');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleAddNote(e: React.FormEvent) {
    e.preventDefault();
    if (!order || !noteSubject.trim()) return;

    setNoteSaving(true);
    try {
      const res = await fetch('/api/communications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: order.customer,
          type: 'note',
          subject: noteSubject.trim(),
          content: noteContent.trim(),
          date: new Date().toISOString(),
          logged_by: 'admin',
        }),
      });

      const json = await res.json();
      if (json.success) {
        setNoteSubject('');
        setNoteContent('');
        await loadCommunications(order.customer);
      }
    } catch (err) {
      console.error('Failed to add note:', err);
    } finally {
      setNoteSaving(false);
    }
  }

  function getProductImageUrl(item: OrderItem): string | null {
    const product = item.expand?.product;
    if (!product) return null;
    if (product.image) {
      return getFileUrl('products', product.id, product.image);
    }
    if (product.image_url) {
      return product.image_url;
    }
    return null;
  }

  function getStatusStepIndex(status: OrderStatus): number {
    return ORDER_STATUSES.indexOf(status);
  }

  if (loading) {
    return (
      <div className="text-center py-12 text-gray-500">Loading order...</div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">Order not found</p>
        <Link href="/admin/orders" className="text-blue-600 hover:underline">Back to Orders</Link>
      </div>
    );
  }

  const customer = order.expand?.customer;
  const currentStepIndex = getStatusStepIndex(order.status);
  const workflowAction = WORKFLOW_ACTIONS[order.status];

  return (
    <div>
      <div className="mb-4">
        <Link href="/admin/orders" className="text-sm text-blue-600 hover:underline">
          &larr; Back to Orders
        </Link>
      </div>

      <PageHeader
        title={`Order ${order.order_number}`}
        description={customer?.business_name || 'Order Details'}
        actions={
          <Badge variant="status" status={order.status}>
            {formatOrderStatus(order.status)}
          </Badge>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>Order Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
                <div>
                  <span className="text-gray-500 block mb-1">Order Number</span>
                  <span className="font-medium text-gray-900">{order.order_number}</span>
                </div>
                <div>
                  <span className="text-gray-500 block mb-1">Status</span>
                  <Badge variant="status" status={order.status}>
                    {formatOrderStatus(order.status)}
                  </Badge>
                </div>
                <div>
                  <span className="text-gray-500 block mb-1">Payment Method</span>
                  <Badge>
                    {order.payment_method === 'square' ? 'Credit Card (Square)' : 'Invoice'}
                  </Badge>
                </div>
                <div>
                  <span className="text-gray-500 block mb-1">Customer</span>
                  {customer ? (
                    <Link
                      href={`/admin/customers/${customer.id}`}
                      className="text-blue-600 hover:underline font-medium"
                    >
                      {customer.business_name}
                    </Link>
                  ) : (
                    <span className="text-gray-400">Unknown</span>
                  )}
                </div>
                <div>
                  <span className="text-gray-500 block mb-1">Date Placed</span>
                  <span className="text-gray-900">{formatDate(order.created)}</span>
                </div>
                {order.shipped_date && (
                  <div>
                    <span className="text-gray-500 block mb-1">Shipped Date</span>
                    <span className="text-gray-900">{formatDate(order.shipped_date)}</span>
                  </div>
                )}
                {order.delivered_date && (
                  <div>
                    <span className="text-gray-500 block mb-1">Delivered Date</span>
                    <span className="text-gray-900">{formatDate(order.delivered_date)}</span>
                  </div>
                )}
                {order.tracking_number && (
                  <div>
                    <span className="text-gray-500 block mb-1">Tracking Number</span>
                    <span className="font-mono text-gray-900">{order.tracking_number}</span>
                  </div>
                )}
                {order.shipping_address && (
                  <div className="col-span-2">
                    <span className="text-gray-500 block mb-1">Shipping Address</span>
                    <span className="text-gray-900 whitespace-pre-line">{order.shipping_address}</span>
                  </div>
                )}
                {order.notes && (
                  <div className="col-span-2">
                    <span className="text-gray-500 block mb-1">Notes</span>
                    <span className="text-gray-900 whitespace-pre-line">{order.notes}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Order Items Table Card */}
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left px-6 py-3 font-medium text-gray-500">Product</th>
                      <th className="text-center px-6 py-3 font-medium text-gray-500">Qty</th>
                      <th className="text-right px-6 py-3 font-medium text-gray-500">Unit Price</th>
                      <th className="text-right px-6 py-3 font-medium text-gray-500">Line Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {items.map((item) => {
                      const product = item.expand?.product;
                      const imageUrl = getProductImageUrl(item);
                      return (
                        <tr key={item.id}>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              {imageUrl ? (
                                <img
                                  src={imageUrl}
                                  alt={product?.title || 'Product'}
                                  className="w-10 h-10 rounded object-cover border border-gray-200"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center">
                                  <span className="text-gray-400 text-xs">N/A</span>
                                </div>
                              )}
                              <div>
                                <p className="font-medium text-gray-900">
                                  {product?.short_title || product?.title || 'Product'}
                                </p>
                                <p className="text-xs text-gray-400">{product?.sku || ''}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center text-gray-900">{item.quantity}</td>
                          <td className="px-6 py-4 text-right text-gray-900">
                            {formatCurrency(item.unit_price)}
                          </td>
                          <td className="px-6 py-4 text-right font-medium text-gray-900">
                            {formatCurrency(item.line_total)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="border-t border-gray-200 px-6 py-4">
                <div className="flex justify-end">
                  <div className="w-64 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Subtotal</span>
                      <span className="text-gray-900">{formatCurrency(order.subtotal)}</span>
                    </div>
                    {order.discount_percent > 0 && (
                      <div className="flex justify-between text-green-700">
                        <span>Discount ({order.discount_percent}%)</span>
                        <span>-{formatCurrency(order.discount_amount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-semibold text-base border-t border-gray-200 pt-2">
                      <span className="text-gray-900">Total</span>
                      <span className="text-gray-900">{formatCurrency(order.total)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Workflow Actions Card */}
          <Card>
            <CardHeader>
              <CardTitle>Workflow Actions</CardTitle>
            </CardHeader>
            <CardContent>
              {workflowAction.label ? (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Current status: <strong>{formatOrderStatus(order.status)}</strong>
                    {' '}&rarr;{' '}
                    Next step: <strong>{formatOrderStatus(workflowAction.nextStatus)}</strong>
                  </p>

                  {/* Tracking number input for shipped transition */}
                  {showTrackingInput && workflowAction.needsTracking && (
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <Input
                        label="Tracking Number (optional)"
                        placeholder="Enter tracking number..."
                        value={trackingNumber}
                        onChange={(e) => setTrackingNumber(e.target.value)}
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleWorkflowAction(workflowAction.nextStatus)}
                          disabled={actionLoading}
                        >
                          {actionLoading ? 'Updating...' : 'Confirm Ship'}
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            setShowTrackingInput(false);
                            setTrackingNumber('');
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Standard workflow button */}
                  {!showTrackingInput && (
                    <Button
                      onClick={() => handleWorkflowAction(workflowAction.nextStatus)}
                      disabled={actionLoading}
                    >
                      {actionLoading ? 'Updating...' : workflowAction.label}
                    </Button>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  This order has reached the final status: <strong>{formatOrderStatus(order.status)}</strong>.
                  No further workflow actions available.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right column - 1/3 width */}
        <div className="space-y-6">
          {/* Status Timeline Card */}
          <Card>
            <CardHeader>
              <CardTitle>Status Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                {ORDER_STATUSES.map((status, index) => {
                  const stepIndex = index;
                  const isCurrent = status === order.status;
                  const isPast = stepIndex < currentStepIndex;
                  const isFuture = stepIndex > currentStepIndex;

                  return (
                    <div key={status} className="flex items-start gap-3 relative">
                      {/* Connector line */}
                      {index < ORDER_STATUSES.length - 1 && (
                        <div
                          className={`absolute left-[11px] top-6 w-0.5 h-full ${
                            isPast ? 'bg-green-400' : 'bg-gray-200'
                          }`}
                        />
                      )}

                      {/* Status dot */}
                      <div className="relative z-10 flex-shrink-0">
                        {isPast ? (
                          <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        ) : isCurrent ? (
                          <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-white" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-gray-200" />
                        )}
                      </div>

                      {/* Label */}
                      <div className={`pb-6 ${isCurrent ? 'font-semibold text-blue-700' : isPast ? 'text-green-700' : 'text-gray-400'}`}>
                        <p className="text-sm leading-6">{formatOrderStatus(status)}</p>
                        {isCurrent && status === 'shipped' && order.shipped_date && (
                          <p className="text-xs font-normal text-gray-500 mt-0.5">
                            {formatDate(order.shipped_date)}
                          </p>
                        )}
                        {isCurrent && status === 'delivered' && order.delivered_date && (
                          <p className="text-xs font-normal text-gray-500 mt-0.5">
                            {formatDate(order.delivered_date)}
                          </p>
                        )}
                        {isPast && status === 'shipped' && order.shipped_date && (
                          <p className="text-xs font-normal text-gray-500 mt-0.5">
                            {formatDate(order.shipped_date)}
                          </p>
                        )}
                        {isPast && status === 'delivered' && order.delivered_date && (
                          <p className="text-xs font-normal text-gray-500 mt-0.5">
                            {formatDate(order.delivered_date)}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Communications Card */}
          <Card>
            <CardHeader>
              <CardTitle>Activity Log</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Add Note Form */}
              <form onSubmit={handleAddNote} className="mb-6 space-y-3">
                <Input
                  placeholder="Subject"
                  value={noteSubject}
                  onChange={(e) => setNoteSubject(e.target.value)}
                  required
                />
                <Textarea
                  placeholder="Add a note..."
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  className="min-h-[80px]"
                />
                <Button type="submit" size="sm" disabled={noteSaving || !noteSubject.trim()}>
                  {noteSaving ? 'Saving...' : 'Add Note'}
                </Button>
              </form>

              {/* Communications list */}
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {communications.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-4">No activity yet</p>
                ) : (
                  communications.map((comm) => (
                    <div
                      key={comm.id}
                      className="border-l-2 border-gray-200 pl-3 py-1"
                    >
                      <div className="flex items-center gap-2 mb-0.5">
                        <Badge variant="status" status={comm.type}>
                          {comm.type.replace(/_/g, ' ')}
                        </Badge>
                        <span className="text-xs text-gray-400">
                          {formatDate(comm.date)}
                        </span>
                      </div>
                      {comm.subject && (
                        <p className="text-sm font-medium text-gray-900">{comm.subject}</p>
                      )}
                      {comm.content && (
                        <p className="text-sm text-gray-600 mt-0.5">{comm.content}</p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
