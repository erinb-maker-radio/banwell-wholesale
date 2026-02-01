'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Customer, Order, Communication, CuratedProduct, Product, CommunicationType } from '@/lib/types';
import { formatCurrency, formatDate, getStatusColor, formatOrderStatus, normalizeUrl, getDisplayUrl } from '@/lib/utils';
import PageHeader from '@/components/layout/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Select from '@/components/ui/Select';
import Badge from '@/components/ui/Badge';

interface CustomerDetail extends Customer {
  orders?: Order[];
  communications?: Communication[];
  curated_products?: CuratedProduct[];
}

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [customer, setCustomer] = useState<CustomerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Curated catalog state
  const [showAddProducts, setShowAddProducts] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // Communications state
  const [showLogActivity, setShowLogActivity] = useState(false);
  const [commType, setCommType] = useState<CommunicationType>('note');
  const [commSubject, setCommSubject] = useState('');
  const [commContent, setCommContent] = useState('');
  const [commSubmitting, setCommSubmitting] = useState(false);

  // Delete state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchCustomer();
  }, [id]);

  async function fetchCustomer() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/customers/${id}`);
      const json = await res.json();
      if (json.success && json.data) {
        setCustomer(json.data);
      } else {
        setError(json.error || 'Failed to load customer');
      }
    } catch (err) {
      setError('Failed to load customer');
    } finally {
      setLoading(false);
    }
  }

  async function handleSearchProducts() {
    if (!productSearch.trim()) return;
    setSearchLoading(true);
    try {
      const res = await fetch(`/api/products?search=${encodeURIComponent(productSearch)}`);
      const json = await res.json();
      if (json.success && json.data?.items) {
        setSearchResults(json.data.items);
      }
    } catch (err) {
      // Silently fail search
    } finally {
      setSearchLoading(false);
    }
  }

  async function handleAddProduct(productId: string) {
    try {
      const res = await fetch(`/api/customers/${id}/curated`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productIds: [productId] }),
      });
      const json = await res.json();
      if (json.success) {
        // Remove the added product from search results
        setSearchResults((prev) => prev.filter((p) => p.id !== productId));
        fetchCustomer();
      }
    } catch (err) {
      // Silently fail
    }
  }

  async function handleRemoveCurated(productId: string) {
    try {
      const res = await fetch(`/api/customers/${id}/curated?productId=${productId}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (json.success) {
        fetchCustomer();
      }
    } catch (err) {
      // Silently fail
    }
  }

  async function handleLogActivity() {
    if (!commSubject.trim()) return;
    setCommSubmitting(true);
    try {
      const res = await fetch('/api/communications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: id,
          type: commType,
          subject: commSubject,
          content: commContent,
          date: new Date().toISOString(),
          logged_by: 'admin',
        }),
      });
      const json = await res.json();
      if (json.success) {
        setCommType('note');
        setCommSubject('');
        setCommContent('');
        setShowLogActivity(false);
        fetchCustomer();
      }
    } catch (err) {
      // Silently fail
    } finally {
      setCommSubmitting(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/customers/${id}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (json.success) {
        router.push('/admin/customers');
      } else {
        setError(json.error || 'Failed to delete customer');
        setShowDeleteConfirm(false);
      }
    } catch (err) {
      setError('Failed to delete customer');
      setShowDeleteConfirm(false);
    } finally {
      setDeleting(false);
    }
  }

  const tierLabels: Record<string, string> = {
    auto: 'Auto',
    tier1: 'Tier 1',
    tier2: 'Tier 2',
    tier3: 'Tier 3',
  };

  const commTypeLabels: Record<string, string> = {
    call: 'Phone Call',
    email: 'Email',
    meeting: 'Meeting',
    note: 'Note',
    order_placed: 'Order Placed',
    payment_received: 'Payment Received',
    shipped: 'Shipped',
    follow_up: 'Follow Up',
  };

  if (loading) {
    return (
      <div>
        <PageHeader title="Customer Details" />
        <div className="text-center py-12 text-gray-500">Loading customer...</div>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div>
        <PageHeader title="Customer Details" />
        <div className="text-center py-12 text-red-600">{error || 'Customer not found'}</div>
      </div>
    );
  }

  const curatedProducts = customer.curated_products || [];
  const orders = customer.orders || [];
  const communications = customer.communications || [];

  return (
    <div>
      <PageHeader
        title={customer.business_name}
        description={`Customer since ${formatDate(customer.created)}`}
        actions={
          <Link href="/admin/customers">
            <Button variant="secondary">Back to Customers</Button>
          </Link>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Business Name</dt>
                  <dd className="mt-1 text-sm text-gray-900">{customer.business_name}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Contact Name</dt>
                  <dd className="mt-1 text-sm text-gray-900">{customer.contact_name}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Email</dt>
                  <dd className="mt-1 text-sm">
                    <a href={`mailto:${customer.email}`} className="text-blue-600 hover:text-blue-800">
                      {customer.email}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Phone</dt>
                  <dd className="mt-1 text-sm">
                    {customer.phone ? (
                      <a href={`tel:${customer.phone}`} className="text-blue-600 hover:text-blue-800">
                        {customer.phone}
                      </a>
                    ) : (
                      <span className="text-gray-400">Not provided</span>
                    )}
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">Address</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {customer.address ? (
                      <>
                        {customer.address}
                        {customer.city && `, ${customer.city}`}
                        {customer.state && `, ${customer.state}`}
                        {customer.zip && ` ${customer.zip}`}
                      </>
                    ) : (
                      <span className="text-gray-400">Not provided</span>
                    )}
                  </dd>
                </div>
                {customer.website && (
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-gray-500">Website</dt>
                    <dd className="mt-1 text-sm">
                      <a
                        href={normalizeUrl(customer.website)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {getDisplayUrl(customer.website)}
                      </a>
                    </dd>
                  </div>
                )}
                <div>
                  <dt className="text-sm font-medium text-gray-500">Status</dt>
                  <dd className="mt-1">
                    <Badge variant="status" status={customer.status}>
                      {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
                    </Badge>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Discount Tier</dt>
                  <dd className="mt-1">
                    <Badge variant="status" status={customer.discount_tier}>
                      {tierLabels[customer.discount_tier] || customer.discount_tier}
                    </Badge>
                  </dd>
                </div>
                {customer.notes && (
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-gray-500">Notes</dt>
                    <dd className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{customer.notes}</dd>
                  </div>
                )}
              </dl>
            </CardContent>
          </Card>

          {/* Curated Catalog */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Curated Catalog</CardTitle>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowAddProducts(!showAddProducts)}
                >
                  {showAddProducts ? 'Cancel' : 'Add Products'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Add Products Search */}
              {showAddProducts && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex gap-2 mb-3">
                    <div className="flex-1">
                      <Input
                        placeholder="Search products by name or SKU..."
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearchProducts()}
                      />
                    </div>
                    <Button size="sm" onClick={handleSearchProducts} disabled={searchLoading}>
                      {searchLoading ? 'Searching...' : 'Search'}
                    </Button>
                  </div>
                  {searchResults.length > 0 && (
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {searchResults.map((product) => (
                        <div
                          key={product.id}
                          className="flex items-center justify-between p-2 bg-white rounded border border-gray-100"
                        >
                          <div className="flex items-center gap-3">
                            {(product.image || product.image_url) && (
                              <img
                                src={product.image_url || product.image}
                                alt={product.title}
                                className="w-10 h-10 rounded object-cover"
                              />
                            )}
                            <div>
                              <p className="text-sm font-medium text-gray-900">{product.title}</p>
                              <p className="text-xs text-gray-500">{product.sku}</p>
                            </div>
                          </div>
                          <Button size="sm" onClick={() => handleAddProduct(product.id)}>
                            Add
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                  {searchResults.length === 0 && productSearch && !searchLoading && (
                    <p className="text-sm text-gray-500 text-center py-2">No products found.</p>
                  )}
                </div>
              )}

              {/* Curated Products Grid */}
              {curatedProducts.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {curatedProducts.map((cp) => {
                    const product = cp.expand?.product;
                    if (!product) return null;
                    return (
                      <div
                        key={cp.id}
                        className="group relative border border-gray-200 rounded-lg p-3 hover:border-gray-300 transition-colors"
                      >
                        {(product.image || product.image_url) && (
                          <img
                            src={product.image_url || product.image}
                            alt={product.title}
                            className="w-full aspect-square rounded object-cover mb-2"
                          />
                        )}
                        <p className="text-sm font-medium text-gray-900 truncate">{product.title}</p>
                        <p className="text-xs text-gray-500">{product.sku}</p>
                        <p className="text-sm text-gray-700 mt-1">{formatCurrency(product.retail_price)}</p>
                        <button
                          onClick={() => handleRemoveCurated(product.id)}
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-red-100 text-red-600 rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-200"
                          title="Remove from catalog"
                        >
                          X
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-6">
                  No curated products yet. Click &quot;Add Products&quot; to build this customer&apos;s catalog.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Orders */}
          <Card>
            <CardHeader>
              <CardTitle>Orders</CardTitle>
            </CardHeader>
            <CardContent>
              {orders.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-500">Order #</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500">Date</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-500">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr
                          key={order.id}
                          className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                        >
                          <td className="py-3 px-4">
                            <Link
                              href={`/admin/orders/${order.id}`}
                              className="text-blue-600 hover:text-blue-800 font-medium"
                            >
                              {order.order_number}
                            </Link>
                          </td>
                          <td className="py-3 px-4 text-gray-700">
                            {formatDate(order.created)}
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant="status" status={order.status}>
                              {formatOrderStatus(order.status)}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-right text-gray-900 font-medium">
                            {formatCurrency(order.total)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-6">No orders yet.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - 1/3 width */}
        <div className="space-y-6">
          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href={`/admin/customers/${id}/edit`} className="block">
                <Button variant="secondary" className="w-full">
                  Edit Customer
                </Button>
              </Link>

              {!showDeleteConfirm ? (
                <Button
                  variant="danger"
                  className="w-full"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  Delete Customer
                </Button>
              ) : (
                <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-sm text-red-800 mb-3">
                    Are you sure? This will permanently delete this customer and all associated data.
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="danger"
                      size="sm"
                      className="flex-1"
                      onClick={handleDelete}
                      disabled={deleting}
                    >
                      {deleting ? 'Deleting...' : 'Confirm Delete'}
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="flex-1"
                      onClick={() => setShowDeleteConfirm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Communications */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Communications</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowLogActivity(!showLogActivity)}
                >
                  {showLogActivity ? 'Cancel' : 'Log Activity'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Log Activity Form */}
              {showLogActivity && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
                  <Select
                    id="comm-type"
                    label="Type"
                    value={commType}
                    onChange={(e) => setCommType(e.target.value as CommunicationType)}
                    options={[
                      { value: 'call', label: 'Phone Call' },
                      { value: 'email', label: 'Email' },
                      { value: 'meeting', label: 'Meeting' },
                      { value: 'note', label: 'Note' },
                    ]}
                  />
                  <Input
                    id="comm-subject"
                    label="Subject"
                    placeholder="Brief subject..."
                    value={commSubject}
                    onChange={(e) => setCommSubject(e.target.value)}
                  />
                  <Textarea
                    id="comm-content"
                    label="Content"
                    placeholder="Details..."
                    value={commContent}
                    onChange={(e) => setCommContent(e.target.value)}
                  />
                  <Button
                    size="sm"
                    onClick={handleLogActivity}
                    disabled={commSubmitting || !commSubject.trim()}
                  >
                    {commSubmitting ? 'Saving...' : 'Save Activity'}
                  </Button>
                </div>
              )}

              {/* Activity Log */}
              {communications.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {communications.map((comm) => (
                    <div
                      key={comm.id}
                      className="p-3 border border-gray-100 rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-gray-500 uppercase">
                          {commTypeLabels[comm.type] || comm.type}
                        </span>
                        <span className="text-xs text-gray-400">
                          {formatDate(comm.date)}
                        </span>
                      </div>
                      {comm.subject && (
                        <p className="text-sm font-medium text-gray-900">{comm.subject}</p>
                      )}
                      {comm.content && (
                        <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">{comm.content}</p>
                      )}
                      {comm.logged_by && (
                        <p className="text-xs text-gray-400 mt-1">Logged by {comm.logged_by}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">No activity logged yet.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
