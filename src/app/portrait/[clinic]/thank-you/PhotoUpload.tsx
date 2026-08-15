'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';

// Photo upload island for the post-payment thank-you page. The checkout API
// appends ?o=<vet_orders id> to Square's redirect URL; when present, the buyer
// can attach their design photo right now instead of waiting for our email.
// If the param is missing (old links, stripped params), we render nothing and
// the page's email-fallback copy stands on its own.
// Also reused by the gift-recipient page (/photo/[order]), which passes the
// order id as a prop instead of a query param.
export default function PhotoUpload({ order }: { order?: string }) {
  const searchParams = useSearchParams();
  const orderId = order || searchParams.get('o') || '';
  const [files, setFiles] = useState<FileList | null>(null);
  const [state, setState] = useState<'idle' | 'sending' | 'done'>('idle');
  const [error, setError] = useState('');

  if (!/^[a-z0-9]{15}$/i.test(orderId)) return null;

  async function handleUpload() {
    if (!files || !files.length) {
      setError('Choose a photo first.');
      return;
    }
    setError('');
    setState('sending');
    try {
      const form = new FormData();
      form.append('order', orderId);
      for (const f of Array.from(files).slice(0, 3)) form.append('photo', f);
      const res = await fetch('/api/vet/upload', { method: 'POST', body: form });
      const data = await res.json();
      if (data.ok) {
        setState('done');
        fetch('/api/vet/event', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ event: 'photo_uploaded', meta: orderId }),
        }).catch(() => {});
      } else {
        setState('idle');
        setError(data.error || 'Upload failed — please try again.');
      }
    } catch {
      setState('idle');
      setError('Upload failed — please try again or email erin@banwelldesigns.com.');
    }
  }

  if (state === 'done') {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8 text-left">
        <h2 className="font-semibold text-gray-900 mb-2">Photo received — you&apos;re all set</h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          We have your photo. Next you&apos;ll get a digital proof of your portrait by email to
          approve before anything is made.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border-2 border-blue-200 rounded-xl p-6 mb-8 text-left shadow-sm">
      <h2 className="font-semibold text-gray-900 mb-2">Send us your photo now</h2>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        Skip the wait — upload your favorite photo right here and we&apos;ll start designing.
        Any clear, well-lit photo works. Up to 3 photos, 15MB each.
      </p>
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
        multiple
        onChange={e => setFiles(e.target.files)}
        className="block w-full text-sm text-gray-600 mb-4 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 file:font-medium hover:file:bg-blue-100"
      />
      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
      <button
        onClick={handleUpload}
        disabled={state === 'sending'}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
      >
        {state === 'sending' ? 'Uploading...' : 'Upload photo'}
      </button>
      <p className="text-xs text-gray-400 mt-2 text-center">
        Prefer email? No problem — we&apos;ll email you within one business day instead.
      </p>
    </div>
  );
}
