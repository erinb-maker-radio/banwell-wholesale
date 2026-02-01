'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Customer } from '@/lib/types';
import PageHeader from '@/components/layout/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';

interface CustomerFormData {
  business_name: string;
  contact_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  website: string;
  notes: string;
  status: string;
  discount_tier: string;
}

export default function EditCustomerPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<CustomerFormData>({
    business_name: '',
    contact_name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    website: '',
    notes: '',
    status: 'active',
    discount_tier: 'auto',
  });

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
        const c: Customer = json.data;
        setCustomer(c);
        setForm({
          business_name: c.business_name || '',
          contact_name: c.contact_name || '',
          email: c.email || '',
          phone: c.phone || '',
          address: c.address || '',
          city: c.city || '',
          state: c.state || '',
          zip: c.zip || '',
          website: c.website || '',
          notes: c.notes || '',
          status: c.status || 'active',
          discount_tier: c.discount_tier || 'auto',
        });
      } else {
        setError(json.error || 'Failed to load customer');
      }
    } catch (err) {
      setError('Failed to load customer');
    } finally {
      setLoading(false);
    }
  }

  function handleChange(field: keyof CustomerFormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/customers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (json.success) {
        router.push(`/admin/customers/${id}`);
      } else {
        setError(json.error || 'Failed to save customer');
      }
    } catch (err) {
      setError('Failed to save customer');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div>
        <PageHeader title="Edit Customer" />
        <div className="text-center py-12 text-gray-500">Loading customer...</div>
      </div>
    );
  }

  if (error && !customer) {
    return (
      <div>
        <PageHeader title="Edit Customer" />
        <div className="text-center py-12 text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Edit Customer"
        description={customer?.business_name || ''}
        actions={
          <Button variant="secondary" onClick={() => router.push(`/admin/customers/${id}`)}>
            Cancel
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Customer Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
                {error}
              </div>
            )}

            {/* Business Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                id="business_name"
                label="Business Name"
                value={form.business_name}
                onChange={(e) => handleChange('business_name', e.target.value)}
                required
              />
              <Input
                id="contact_name"
                label="Contact Name"
                value={form.contact_name}
                onChange={(e) => handleChange('contact_name', e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                id="email"
                label="Email"
                type="email"
                value={form.email}
                onChange={(e) => handleChange('email', e.target.value)}
                required
              />
              <Input
                id="phone"
                label="Phone"
                type="tel"
                value={form.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
              />
            </div>

            {/* Address */}
            <Input
              id="address"
              label="Street Address"
              value={form.address}
              onChange={(e) => handleChange('address', e.target.value)}
            />

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="col-span-2">
                <Input
                  id="city"
                  label="City"
                  value={form.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                />
              </div>
              <Input
                id="state"
                label="State"
                value={form.state}
                onChange={(e) => handleChange('state', e.target.value)}
              />
              <Input
                id="zip"
                label="ZIP Code"
                value={form.zip}
                onChange={(e) => handleChange('zip', e.target.value)}
              />
            </div>

            <Input
              id="website"
              label="Website"
              type="url"
              placeholder="https://example.com"
              value={form.website}
              onChange={(e) => handleChange('website', e.target.value)}
            />

            {/* Status and Tier */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                id="status"
                label="Status"
                value={form.status}
                onChange={(e) => handleChange('status', e.target.value)}
                options={[
                  { value: 'active', label: 'Active' },
                  { value: 'inactive', label: 'Inactive' },
                  { value: 'pending', label: 'Pending' },
                ]}
              />
              <Select
                id="discount_tier"
                label="Discount Tier"
                value={form.discount_tier}
                onChange={(e) => handleChange('discount_tier', e.target.value)}
                options={[
                  { value: 'auto', label: 'Auto (based on order history)' },
                  { value: 'tier1', label: 'Tier 1' },
                  { value: 'tier2', label: 'Tier 2' },
                  { value: 'tier3', label: 'Tier 3' },
                ]}
              />
            </div>

            {/* Notes */}
            <Textarea
              id="notes"
              label="Notes"
              placeholder="Internal notes about this customer..."
              value={form.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
            />

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.push(`/admin/customers/${id}`)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
