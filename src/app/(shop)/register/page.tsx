'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const form = new FormData(e.currentTarget);
    const data = Object.fromEntries(form);

    if (data.password !== data.passwordConfirm) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        setError(result.error || 'Registration failed');
        setLoading(false);
        return;
      }

      router.push('/login?registered=true');
    } catch {
      setError('Network error. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Create Wholesale Account</h1>
      <p className="text-gray-500 mb-8">Register to access wholesale pricing and place orders.</p>

      {error && (
        <div className="bg-red-50 text-red-700 text-sm p-4 rounded-lg mb-6">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input label="Business Name" name="business_name" required id="business_name" />
          <Input label="Contact Name" name="contact_name" required id="contact_name" />
        </div>
        <Input label="Email" name="email" type="email" required id="email" />
        <Input label="Phone" name="phone" type="tel" id="phone" />
        <div className="grid grid-cols-2 gap-4">
          <Input label="Password" name="password" type="password" required id="password" />
          <Input label="Confirm Password" name="passwordConfirm" type="password" required id="passwordConfirm" />
        </div>

        <hr className="my-6" />

        <Input label="Address" name="address" id="address" />
        <div className="grid grid-cols-3 gap-4">
          <Input label="City" name="city" id="city" />
          <Input label="State" name="state" id="state" />
          <Input label="ZIP" name="zip" id="zip" />
        </div>
        <Input label="Website" name="website" type="url" id="website" placeholder="https://" />

        <Button type="submit" disabled={loading} className="w-full" size="lg">
          {loading ? 'Creating Account...' : 'Create Account'}
        </Button>
      </form>

      <p className="text-sm text-gray-500 text-center mt-6">
        Already have an account? <Link href="/login" className="text-blue-600 hover:underline">Sign in</Link>
      </p>
    </div>
  );
}
