'use client';

import { useState, useEffect } from 'react';
import { formatCurrency } from '@/lib/utils';
import PageHeader from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

interface TopCustomer {
  id: string;
  name: string;
  total: number;
  orders: number;
}

interface PopularProduct {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  revenue: number;
}

interface ReportsData {
  revenueByMonth: Record<string, number>;
  topCustomers: TopCustomer[];
  popularProducts: PopularProduct[];
  tierDistribution: Record<string, number>;
  totalOrders: number;
  totalRevenue: number;
}

export default function ReportsPage() {
  const [data, setData] = useState<ReportsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchReports();
  }, []);

  async function fetchReports() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/reports');
      const json = await res.json();
      if (json.success && json.data) {
        setData(json.data);
      } else {
        setError(json.error || 'Failed to load reports');
      }
    } catch (err) {
      setError('Failed to load reports');
    } finally {
      setLoading(false);
    }
  }

  function formatMonth(monthKey: string): string {
    const [year, month] = monthKey.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
  }

  if (loading) {
    return (
      <div>
        <PageHeader title="Reports" description="Sales analytics and reporting" />
        <div className="text-center py-12 text-gray-500">Loading reports...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <PageHeader title="Reports" description="Sales analytics and reporting" />
        <div className="text-center py-12 text-red-600">{error}</div>
      </div>
    );
  }

  if (!data) return null;

  const averageOrderValue =
    data.totalOrders > 0 ? Math.round(data.totalRevenue / data.totalOrders) : 0;

  // Sort months descending
  const sortedMonths = Object.entries(data.revenueByMonth).sort(
    ([a], [b]) => b.localeCompare(a)
  );
  const maxMonthlyRevenue = Math.max(...Object.values(data.revenueByMonth), 1);

  // Tier ordering for display
  const tierOrder = ['None', '40%', '50%', '55%'];
  const sortedTiers = tierOrder
    .filter((tier) => tier in data.tierDistribution)
    .map((tier) => ({ tier, count: data.tierDistribution[tier] }));
  // Include any tiers not in the predefined order
  Object.entries(data.tierDistribution).forEach(([tier, count]) => {
    if (!tierOrder.includes(tier)) {
      sortedTiers.push({ tier, count });
    }
  });
  const maxTierCount = Math.max(...sortedTiers.map((t) => t.count), 1);

  return (
    <div>
      <PageHeader title="Reports" description="Sales analytics and reporting" />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent>
            <div className="py-2">
              <p className="text-sm font-medium text-gray-500">Total Revenue</p>
              <p className="mt-1 text-3xl font-bold text-gray-900">
                {formatCurrency(data.totalRevenue)}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <div className="py-2">
              <p className="text-sm font-medium text-gray-500">Total Orders</p>
              <p className="mt-1 text-3xl font-bold text-gray-900">
                {data.totalOrders}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <div className="py-2">
              <p className="text-sm font-medium text-gray-500">Average Order Value</p>
              <p className="mt-1 text-3xl font-bold text-gray-900">
                {formatCurrency(averageOrderValue)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue by Month */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Revenue by Month</CardTitle>
        </CardHeader>
        <CardContent>
          {sortedMonths.length === 0 ? (
            <p className="text-gray-500 text-sm">No revenue data available.</p>
          ) : (
            <div className="space-y-3">
              {sortedMonths.map(([month, revenue]) => (
                <div key={month} className="flex items-center gap-4">
                  <div className="w-40 text-sm text-gray-700 shrink-0">
                    {formatMonth(month)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                        <div
                          className="bg-blue-500 h-full rounded-full transition-all"
                          style={{
                            width: `${(revenue / maxMonthlyRevenue) * 100}%`,
                          }}
                        />
                      </div>
                      <div className="w-28 text-sm font-medium text-gray-900 text-right shrink-0">
                        {formatCurrency(revenue)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Top Customers */}
        <Card>
          <CardHeader>
            <CardTitle>Top Customers</CardTitle>
          </CardHeader>
          <CardContent>
            {data.topCustomers.length === 0 ? (
              <p className="text-gray-500 text-sm">No customer data available.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 px-3 font-medium text-gray-500 w-10">#</th>
                      <th className="text-left py-2 px-3 font-medium text-gray-500">Customer</th>
                      <th className="text-right py-2 px-3 font-medium text-gray-500">Total Spend</th>
                      <th className="text-right py-2 px-3 font-medium text-gray-500">Orders</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.topCustomers.slice(0, 10).map((customer, index) => (
                      <tr
                        key={customer.id}
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-2 px-3 text-gray-400 font-medium">
                          {index + 1}
                        </td>
                        <td className="py-2 px-3 text-gray-900 font-medium">
                          {customer.name}
                        </td>
                        <td className="py-2 px-3 text-right text-gray-900">
                          {formatCurrency(customer.total)}
                        </td>
                        <td className="py-2 px-3 text-right text-gray-700">
                          {customer.orders}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Discount Tier Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Discount Tier Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {sortedTiers.length === 0 ? (
              <p className="text-gray-500 text-sm">No tier data available.</p>
            ) : (
              <div className="space-y-4">
                {sortedTiers.map(({ tier, count }) => (
                  <div key={tier}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{tier}</span>
                      <span className="text-sm text-gray-500">
                        {count} customer{count !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="bg-gray-100 rounded-full h-5 overflow-hidden">
                      <div
                        className="bg-indigo-500 h-full rounded-full transition-all"
                        style={{
                          width: `${(count / maxTierCount) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Popular Products */}
      <Card>
        <CardHeader>
          <CardTitle>Popular Products</CardTitle>
        </CardHeader>
        <CardContent>
          {data.popularProducts.length === 0 ? (
            <p className="text-gray-500 text-sm">No product data available.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-3 font-medium text-gray-500 w-10">#</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-500">Product</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-500">SKU</th>
                    <th className="text-right py-2 px-3 font-medium text-gray-500">Qty Sold</th>
                    <th className="text-right py-2 px-3 font-medium text-gray-500">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {data.popularProducts.slice(0, 20).map((product, index) => (
                    <tr
                      key={product.id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-2 px-3 text-gray-400 font-medium">
                        {index + 1}
                      </td>
                      <td className="py-2 px-3 text-gray-900 font-medium">
                        {product.name}
                      </td>
                      <td className="py-2 px-3 text-gray-500 font-mono text-xs">
                        {product.sku}
                      </td>
                      <td className="py-2 px-3 text-right text-gray-700">
                        {product.quantity}
                      </td>
                      <td className="py-2 px-3 text-right text-gray-900">
                        {formatCurrency(product.revenue)}
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
