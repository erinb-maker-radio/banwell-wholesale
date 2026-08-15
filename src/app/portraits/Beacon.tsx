'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

// First-party page-view beacon for the portraits pages. Fires once per
// pathname change. No cookies, no identifiers — counts only.
export default function Beacon() {
  const pathname = usePathname();

  useEffect(() => {
    try {
      fetch('/api/vet/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'page_view',
          // Include the query string so campaign tags survive (e.g. the
          // package-insert QR lands on /?via=insert).
          path: pathname + (window.location.search || ''),
          ref: document.referrer || '',
        }),
        keepalive: true,
      }).catch(() => {});
    } catch {
      /* analytics must never break the page */
    }
  }, [pathname]);

  return null;
}
