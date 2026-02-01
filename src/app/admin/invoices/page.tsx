'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Invoice, InvoiceStatus } from '@/lib/types';
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils';
import PageHeader from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

type StatusFilter = 'all' | InvoiceStatus;

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchInvoices();
  }, [statusFilter]);

  async function fetchInvoices() {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') {
        params.set('status', statusFilter);
      }
      const res = await fetch(`/api/invoices?${params.toString()}`);
      const json = await res.json();
      if (json.success && json.data?.items) {
        setInvoices(json.data.items);
      } else {
        setError(json.error || 'Failed to load invoices');
      }
    } catch (err) {
      setError('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  }

  async function updateInvoiceStatus(
    invoiceId: string,
    updates: Partial<Invoice>
  ) {
    setUpdatingId(invoiceId);
    try {
      const res = await fetch(`/api/invoices/${invoiceId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const json = await res.json();
      if (json.success) {
        await fetchInvoices();
      } else {
        setError(json.error || 'Failed to update invoice');
      }
    } catch (err) {
      setError('Failed to update invoice');
    } finally {
      setUpdatingId(null);
    }
  }

  function handleSend(invoice: Invoice) {
    updateInvoiceStatus(invoice.id, { status: 'sent' });
  }

  function handleMarkPaid(invoice: Invoice) {
    updateInvoiceStatus(invoice.id, {
      status: 'paid',
      paid_date: new Date().toISOString(),
      paid_amount: invoice.amount,
    });
  }

  function formatInvoiceStatus(status: string): string {
    const labels: Record<string, string> = {
      draft: 'Draft',
      sent: 'Sent',
      paid: 'Paid',
      overdue: 'Overdue',
      cancelled: 'Cancelled',
    };
    return labels[status] || status;
  }

  const statusOptions: { value: StatusFilter; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'draft', label: 'Draft' },
    { value: 'sent', label: 'Sent' },
    { value: 'paid', label: 'Paid' },
    { value: 'overdue', label: 'Overdue' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <div>
      <PageHeader
        title="Invoices"
        description="Track payment invoices"
      />

      <Card>
        <CardContent>
          {/* Status Filters */}
          <div className="flex flex-wrap gap-2 mb-6">
            {statusOptions.map((opt) => (
              <Button
                key={opt.value}
                variant={statusFilter === opt.value ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setStatusFilter(opt.value)}
              >
                {opt.label}
              </Button>
            ))}
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12 text-gray-500">
              Loading invoices...
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-12 text-red-600">
              {error}
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && invoices.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No invoices found.
            </div>
          )}

          {/* Invoices Table */}
          {!loading && !error && invoices.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Invoice #</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Customer</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Order #</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500">Amount</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Due Date</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((invoice) => (
                    <tr
                      key={invoice.id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-3 px-4 font-medium text-gray-900">
                        {invoice.invoice_number}
                      </td>
                      <td className="py-3 px-4 text-gray-700">
                        {invoice.expand?.customer?.business_name || '—'}
                      </td>
                      <td className="py-3 px-4">
                        {invoice.expand?.order ? (
                          <Link
                            href={`/admin/orders/${invoice.order}`}
                            className="text-blue-600 hover:text-blue-800 font-medium"
                          >
                            {invoice.expand.order.order_number}
                          </Link>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-gray-900">
                        {formatCurrency(invoice.amount)}
                      </td>
                      <td className="py-3 px-4 text-gray-700">
                        {invoice.due_date ? formatDate(invoice.due_date) : '—'}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="status" status={invoice.status}>
                          {formatInvoiceStatus(invoice.status)}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {invoice.status === 'draft' && (
                            <Button
                              size="sm"
                              variant="primary"
                              disabled={updatingId === invoice.id}
                              onClick={() => handleSend(invoice)}
                            >
                              {updatingId === invoice.id ? 'Sending...' : 'Send'}
                            </Button>
                          )}
                          {(invoice.status === 'sent' || invoice.status === 'overdue') && (
                            <Button
                              size="sm"
                              variant="primary"
                              disabled={updatingId === invoice.id}
                              onClick={() => handleMarkPaid(invoice)}
                            >
                              {updatingId === invoice.id ? 'Updating...' : 'Mark Paid'}
                            </Button>
                          )}
                        </div>
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
