'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Customer } from '@/lib/types';
import { formatDate, getStatusColor } from '@/lib/utils';
import PageHeader from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';

type StatusFilter = 'all' | 'active' | 'inactive' | 'pending';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  useEffect(() => {
    fetchCustomers();
  }, [statusFilter]);

  async function fetchCustomers() {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') {
        params.set('status', statusFilter);
      }
      const res = await fetch(`/api/customers?${params.toString()}`);
      const json = await res.json();
      if (json.success && json.data?.items) {
        setCustomers(json.data.items);
      } else {
        setError(json.error || 'Failed to load customers');
      }
    } catch (err) {
      setError('Failed to load customers');
    } finally {
      setLoading(false);
    }
  }

  const filteredCustomers = useMemo(() => {
    if (!search.trim()) return customers;
    const query = search.toLowerCase();
    return customers.filter(
      (c) =>
        c.business_name.toLowerCase().includes(query) ||
        c.contact_name.toLowerCase().includes(query) ||
        c.email.toLowerCase().includes(query)
    );
  }, [customers, search]);

  const statusOptions: { value: StatusFilter; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'pending', label: 'Pending' },
  ];

  const tierLabels: Record<string, string> = {
    auto: 'Auto',
    tier1: 'Tier 1',
    tier2: 'Tier 2',
    tier3: 'Tier 3',
  };

  return (
    <div>
      <PageHeader
        title="Customers"
        description="Manage wholesale customers"
        actions={
          <Link href="/admin/customers/new">
            <Button>Add Customer</Button>
          </Link>
        }
      />

      <Card>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search by business name, contact, or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
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
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12 text-gray-500">
              Loading customers...
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-12 text-red-600">
              {error}
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && filteredCustomers.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              {search ? 'No customers match your search.' : 'No customers found.'}
            </div>
          )}

          {/* Customers Table */}
          {!loading && !error && filteredCustomers.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Business Name</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Contact</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Email</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Discount Tier</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Date Added</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.map((customer) => (
                    <tr
                      key={customer.id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <Link
                          href={`/admin/customers/${customer.id}`}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          {customer.business_name}
                        </Link>
                      </td>
                      <td className="py-3 px-4 text-gray-700">
                        {customer.contact_name}
                      </td>
                      <td className="py-3 px-4 text-gray-700">
                        {customer.email}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="status" status={customer.status}>
                          {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="status" status={customer.discount_tier}>
                          {tierLabels[customer.discount_tier] || customer.discount_tier}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-gray-500">
                        {formatDate(customer.created)}
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
