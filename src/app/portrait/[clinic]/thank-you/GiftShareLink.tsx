'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';

// Shareable photo-request link for gift orders. Rendered under the upload
// widget on the thank-you page: if the buyer is gifting and doesn't have the
// right photo, they copy this link and send it to the recipient, who uploads
// the photo on a clean page with no prices or order details.
export default function GiftShareLink() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('o') || '';
  const [copied, setCopied] = useState(false);

  if (!/^[a-z0-9]{15}$/i.test(orderId)) return null;

  const shareUrl =
    typeof window !== 'undefined' ? `${window.location.origin}/photo/${orderId}` : '';

  async function copy() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      /* clipboard unavailable — the input below is selectable */
    }
  }

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-8 text-left">
      <h2 className="font-semibold text-gray-900 mb-2">Buying this as a gift?</h2>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        If someone else has the perfect photo, share this link with them &mdash; they can upload
        it directly and we&apos;ll design from it. No prices or order details are shown on that
        page.
      </p>
      <div className="flex gap-2">
        <input
          type="text"
          readOnly
          value={shareUrl}
          onFocus={e => e.target.select()}
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-600 bg-white"
        />
        <button
          onClick={copy}
          className="bg-gray-900 hover:bg-gray-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors whitespace-nowrap"
        >
          {copied ? 'Copied' : 'Copy link'}
        </button>
      </div>
    </div>
  );
}
