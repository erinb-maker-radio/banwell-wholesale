'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get('registered');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const form = new FormData(e.currentTarget);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.get('email'),
          password: form.get('password'),
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        setError(result.error || 'Login failed');
        setLoading(false);
        return;
      }

      router.push('/account');
    } catch {
      setError('Network error. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Sign In</h1>
      <p className="text-gray-500 mb-8">Access your wholesale account.</p>

      {registered && (
        <div className="bg-green-50 text-green-700 text-sm p-4 rounded-lg mb-6">
          Account created! You can now sign in.
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-700 text-sm p-4 rounded-lg mb-6">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Email" name="email" type="email" required id="email" />
        <Input label="Password" name="password" type="password" required id="password" />
        <Button type="submit" disabled={loading} className="w-full" size="lg">
          {loading ? 'Signing in...' : 'Sign In'}
        </Button>
      </form>

      <p className="text-sm text-gray-500 text-center mt-6">
        Need an account? <Link href="/register" className="text-blue-600 hover:underline">Register</Link>
      </p>
    </div>
  );
}
