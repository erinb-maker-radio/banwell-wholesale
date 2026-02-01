'use client';

import { useEffect, useState } from 'react';
import pb from '@/lib/pocketbase';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    business_name: '',
    contact_name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    website: '',
  });

  useEffect(() => {
    const customer = pb.authStore.record;
    if (customer) {
      setForm({
        business_name: customer.business_name || '',
        contact_name: customer.contact_name || '',
        phone: customer.phone || '',
        address: customer.address || '',
        city: customer.city || '',
        state: customer.state || '',
        zip: customer.zip || '',
        website: customer.website || '',
      });
    }
    setLoading(false);
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const customerId = pb.authStore.record?.id;
      if (!customerId) throw new Error('Not authenticated');

      await pb.collection('customers').update(customerId, form);
      setSuccess('Settings saved.');
    } catch (err) {
      setError('Failed to save settings.');
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="text-center py-12 text-gray-500">Loading...</div>;

  return (
    <div className="max-w-2xl">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Account Settings</h2>

      {success && <div className="bg-green-50 text-green-700 text-sm p-4 rounded-lg mb-6">{success}</div>}
      {error && <div className="bg-red-50 text-red-700 text-sm p-4 rounded-lg mb-6">{error}</div>}

      <form onSubmit={handleSave} className="bg-white rounded-lg border p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input label="Business Name" value={form.business_name} onChange={e => setForm(f => ({ ...f, business_name: e.target.value }))} id="business_name" />
          <Input label="Contact Name" value={form.contact_name} onChange={e => setForm(f => ({ ...f, contact_name: e.target.value }))} id="contact_name" />
        </div>
        <Input label="Phone" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} id="phone" />
        <Input label="Address" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} id="address" />
        <div className="grid grid-cols-3 gap-4">
          <Input label="City" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} id="city" />
          <Input label="State" value={form.state} onChange={e => setForm(f => ({ ...f, state: e.target.value }))} id="state" />
          <Input label="ZIP" value={form.zip} onChange={e => setForm(f => ({ ...f, zip: e.target.value }))} id="zip" />
        </div>
        <Input label="Website" value={form.website} onChange={e => setForm(f => ({ ...f, website: e.target.value }))} id="website" />

        <Button type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </form>
    </div>
  );
}
