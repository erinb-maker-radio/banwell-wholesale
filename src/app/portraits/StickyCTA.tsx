'use client';

import { useEffect, useState } from 'react';

// Mobile-only sticky order bar. The order form sits well below the fold on
// phones; this keeps the primary action one thumb-tap away at all times.
// Hides itself while the actual order section is on screen so it never
// covers the real button.
export default function StickyCTA({ fromPrice }: { fromPrice: number }) {
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    const el = document.getElementById('order');
    if (!el) {
      setHidden(false);
      return;
    }
    const obs = new IntersectionObserver(
      entries => setHidden(entries[0].isIntersecting),
      { rootMargin: '0px 0px -15% 0px' },
    );
    obs.observe(el);
    // Show the bar once mounted (not during SSR paint).
    setHidden(el.getBoundingClientRect().top < window.innerHeight);
    return () => obs.disconnect();
  }, []);

  if (hidden) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-[#232946]/97 backdrop-blur border-t border-[#d4a33d] px-4 py-3 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
      <a
        href="#order"
        className="block w-full text-center bg-[#d4a33d] hover:bg-[#c2922f] text-[#232946] font-semibold py-3 rounded-xl transition-colors"
      >
        Order your portrait &mdash; from ${fromPrice}
      </a>
    </div>
  );
}
