'use client';

import { useEffect, useState } from 'react';
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils';
import type { Invoice } from '@/lib/types';
import pb from '@/lib/pocketbase';
import Badge from '@/components/ui/Badge';

export default function CustomerInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const customerId = pb.authStore.record?.id;
    if (!customerId) return;

    pb.collection('invoices').getFullList({
      filter: `customer="${customerId}"`,
      sort: '-created',
      expand: 'order',
    })
      .then(records => setInvoices(records as unknown as Invoice[]))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-12 text-gray-500">Loading...</div>;

  if (invoices.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">No invoices</h2>
        <p className="text-gray-500">Invoices will appear here when you place orders with invoice payment.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-6">Invoices</h2>
      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-6 py-3 font-medium text-gray-500">Invoice</th>
              <th className="text-left px-6 py-3 font-medium text-gray-500">Date</th>
              <th className="text-left px-6 py-3 font-medium text-gray-500">Due</th>
              <th className="text-left px-6 py-3 font-medium text-gray-500">Status</th>
              <th className="text-right px-6 py-3 font-medium text-gray-500">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {invoices.map(inv => (
              <tr key={inv.id}>
                <td className="px-6 py-4 font-medium">{inv.invoice_number}</td>
                <td className="px-6 py-4 text-gray-600">{formatDate(inv.created)}</td>
                <td className="px-6 py-4 text-gray-600">{inv.due_date ? formatDate(inv.due_date) : '-'}</td>
                <td className="px-6 py-4"><Badge variant="status" status={inv.status}>{inv.status}</Badge></td>
                <td className="px-6 py-4 text-right font-medium">{formatCurrency(inv.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
