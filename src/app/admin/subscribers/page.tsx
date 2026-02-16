'use client';

import { useState, useEffect, useMemo } from 'react';
import { Subscriber } from '@/lib/types';
import { formatDate, getStatusColor } from '@/lib/utils';
import PageHeader from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';

type TypeFilter = 'all' | 'retail' | 'wholesale' | 'unsubscribed';

export default function SubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');

  useEffect(() => {
    fetchSubscribers();
  }, [typeFilter]);

  async function fetchSubscribers() {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (typeFilter === 'unsubscribed') {
        params.set('status', 'unsubscribed');
      } else if (typeFilter !== 'all') {
        params.set('type', typeFilter);
        params.set('status', 'active');
      }
      const res = await fetch(`/api/admin/subscribers?${params.toString()}`);
      const json = await res.json();
      if (json.success && json.data?.items) {
        setSubscribers(json.data.items);
      } else {
        setError(json.error || 'Failed to load subscribers');
      }
    } catch {
      setError('Failed to load subscribers');
    } finally {
      setLoading(false);
    }
  }

  const filteredSubscribers = useMemo(() => {
    if (!search.trim()) return subscribers;
    const query = search.toLowerCase();
    return subscribers.filter(
      (s) =>
        s.email.toLowerCase().includes(query) ||
        (s.name && s.name.toLowerCase().includes(query)) ||
        s.discount_code.toLowerCase().includes(query)
    );
  }, [subscribers, search]);

  async function handleExport() {
    window.location.href = '/api/admin/subscribers/export';
  }

  const filterOptions: { value: TypeFilter; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'retail', label: 'Retail' },
    { value: 'wholesale', label: 'Wholesale' },
    { value: 'unsubscribed', label: 'Unsubscribed' },
  ];

  const sourceLabels: Record<string, string> = {
    website_popup: 'Popup',
    website_footer: 'Footer',
    website_landing: 'Landing',
    etsy_insert: 'Etsy Insert',
    etsy_message: 'Etsy Msg',
    manual: 'Manual',
  };

  return (
    <div>
      <PageHeader
        title="Subscribers"
        description="Manage email subscribers and discount codes"
        actions={
          <Button onClick={handleExport} variant="secondary">
            Export CSV
          </Button>
        }
      />

      <Card>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search by email, name, or discount code..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              {filterOptions.map((opt) => (
                <Button
                  key={opt.value}
                  variant={typeFilter === opt.value ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setTypeFilter(opt.value)}
                >
                  {opt.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12 text-gray-500">
              Loading subscribers...
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-12 text-red-600">
              {error}
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && filteredSubscribers.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              {search ? 'No subscribers match your search.' : 'No subscribers found.'}
            </div>
          )}

          {/* Subscribers Table */}
          {!loading && !error && filteredSubscribers.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Email</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Name</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Type</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Source</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Discount Code</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Used</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubscribers.map((sub) => (
                    <tr
                      key={sub.id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-3 px-4 text-gray-900 font-medium">{sub.email}</td>
                      <td className="py-3 px-4 text-gray-700">{sub.name || '—'}</td>
                      <td className="py-3 px-4">
                        <Badge variant="status" status={sub.type}>
                          {sub.type.charAt(0).toUpperCase() + sub.type.slice(1)}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-gray-600 text-xs">
                        {sourceLabels[sub.source] || sub.source}
                      </td>
                      <td className="py-3 px-4">
                        <code className="text-sm bg-gray-100 px-2 py-0.5 rounded">{sub.discount_code}</code>
                      </td>
                      <td className="py-3 px-4">
                        {sub.discount_used ? (
                          <span className="text-green-600 font-medium">Yes</span>
                        ) : (
                          <span className="text-gray-400">No</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="status" status={sub.status}>
                          {sub.status === 'active' ? 'Active' : 'Unsubscribed'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-gray-500">{formatDate(sub.created)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Count */}
          {!loading && !error && filteredSubscribers.length > 0 && (
            <div className="mt-4 text-sm text-gray-500">
              Showing {filteredSubscribers.length} subscriber{filteredSubscribers.length !== 1 ? 's' : ''}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
