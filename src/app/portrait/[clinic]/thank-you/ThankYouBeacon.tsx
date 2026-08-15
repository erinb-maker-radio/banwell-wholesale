'use client';

import { useEffect } from 'react';

// Fires a single thank_you event when the post-payment page loads. This page
// lives outside the /portraits layout tree (Square redirects here), so it
// can't use the shared Beacon — count conversions here directly.
export default function ThankYouBeacon() {
  useEffect(() => {
    try {
      fetch('/api/vet/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'thank_you',
          path: window.location.pathname,
        }),
        keepalive: true,
      }).catch(() => {});
    } catch {
      /* analytics must never break the page */
    }
  }, []);

  return null;
}
