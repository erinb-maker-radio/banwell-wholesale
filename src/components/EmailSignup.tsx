'use client';

import { useState } from 'react';

export default function EmailSignup({ isDark = false }: { isDark?: boolean }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [discountCode, setDiscountCode] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'website_footer', type: 'retail' }),
      });
      const json = await res.json();

      if (json.success) {
        setDiscountCode(json.discountCode);
      } else {
        setError(json.error || 'Please try again.');
      }
    } catch {
      setError('Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const textColor = isDark ? 'text-white/70' : 'text-gray-600';
  const mutedColor = isDark ? 'text-white/40' : 'text-gray-400';

  if (discountCode) {
    return (
      <div className="text-center py-2">
        <p className={`text-[13px] font-medium ${isDark ? 'text-white/80' : 'text-gray-700'}`}>
          Your 25% off code:
        </p>
        <p className="text-lg font-bold text-[#A22020] tracking-wider mt-1">{discountCode}</p>
        <p className={`text-[11px] mt-1 ${mutedColor}`}>
          Use at checkout:{' '}
          <a href="https://www.etsy.com/shop/BanwellDesigns" target="_blank" rel="noopener noreferrer" className="underline">Glass</a>
          {' · '}
          <a href="https://www.etsy.com/shop/banwelldesignleather" target="_blank" rel="noopener noreferrer" className="underline">Leather</a>
          {' · '}
          <a href="https://www.etsy.com/shop/banwelldesignpaper" target="_blank" rel="noopener noreferrer" className="underline">Paper</a>
        </p>
      </div>
    );
  }

  return (
    <div className="text-center py-2">
      <p className={`text-[13px] font-light mb-2 ${textColor}`}>
        Get 25% off your first retail order
      </p>
      <form onSubmit={handleSubmit} className="flex gap-2 max-w-sm mx-auto">
        <input
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className={`flex-1 px-3 py-1.5 text-sm rounded border ${
            isDark
              ? 'bg-white/10 border-white/20 text-white placeholder-white/30'
              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
          } focus:outline-none focus:ring-1 focus:ring-[#A22020]`}
        />
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-1.5 text-sm font-medium text-white bg-[#A22020] hover:bg-[#8a1b1b] rounded transition-colors disabled:opacity-50"
        >
          {loading ? '...' : 'Subscribe'}
        </button>
      </form>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}
