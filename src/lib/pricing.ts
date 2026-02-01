import type { DiscountTierLevel } from './types';

// Discount tier thresholds (in cents)
export const TIER_THRESHOLDS = {
  tier1: { min: 40000, percent: 40, name: 'Tier 1 (40% off)' },
  tier2: { min: 80000, percent: 50, name: 'Tier 2 (50% off)' },
  tier3: { min: 120000, percent: 55, name: 'Tier 3 (55% off)' },
} as const;

// Default retail prices by category (in cents)
export const CATEGORY_PRICES: Record<string, number> = {
  'Glass Ornaments': 3500,
  'Paper Cut Ornaments': 1500,
  'Wooden Ornaments': 3500,
};

// Sun catcher prices by size (in cents)
export const SUN_CATCHER_PRICES: Record<string, number> = {
  '6 inch': 7200,
  '10 inch': 9800,
  '12 inch': 11900,
  '15 inch': 15300,
};

// Default sun catcher price when size is unknown
export const DEFAULT_SUN_CATCHER_PRICE = 7200; // 6 inch default

export interface DiscountResult {
  percent: number;
  amount: number; // cents
  total: number; // cents
  tierName: string;
}

function applyTierDiscount(subtotalCents: number, percent: number, tierName: string): DiscountResult {
  const amount = Math.round(subtotalCents * (percent / 100));
  return {
    percent,
    amount,
    total: subtotalCents - amount,
    tierName,
  };
}

// Calculate the discount for a given subtotal and customer tier setting
export function calculateDiscount(subtotalCents: number, customerTier: DiscountTierLevel = 'auto'): DiscountResult {
  // If customer has a fixed tier override, use that
  if (customerTier !== 'auto') {
    const tier = TIER_THRESHOLDS[customerTier];
    return applyTierDiscount(subtotalCents, tier.percent, tier.name);
  }

  // Auto-calculate from subtotal
  if (subtotalCents >= TIER_THRESHOLDS.tier3.min) {
    return applyTierDiscount(subtotalCents, TIER_THRESHOLDS.tier3.percent, TIER_THRESHOLDS.tier3.name);
  }
  if (subtotalCents >= TIER_THRESHOLDS.tier2.min) {
    return applyTierDiscount(subtotalCents, TIER_THRESHOLDS.tier2.percent, TIER_THRESHOLDS.tier2.name);
  }
  if (subtotalCents >= TIER_THRESHOLDS.tier1.min) {
    return applyTierDiscount(subtotalCents, TIER_THRESHOLDS.tier1.percent, TIER_THRESHOLDS.tier1.name);
  }

  // Under minimum — no wholesale discount
  return {
    percent: 0,
    amount: 0,
    total: subtotalCents,
    tierName: 'No discount (under $400)',
  };
}

// Detect sun catcher size from product title
export function detectSunCatcherSize(title: string): string | undefined {
  const sizePatterns: [RegExp, string][] = [
    [/15\s*(?:inch|in|")/i, '15 inch'],
    [/12\s*(?:inch|in|")/i, '12 inch'],
    [/10\s*(?:inch|in|")/i, '10 inch'],
    [/6\s*(?:inch|in|")/i, '6 inch'],
  ];

  for (const [pattern, size] of sizePatterns) {
    if (pattern.test(title)) return size;
  }
  return undefined;
}

// Get retail price for a product based on category and title
export function getRetailPrice(category: string, title: string): number {
  if (category === 'Glass Sun Catchers') {
    const size = detectSunCatcherSize(title);
    if (size && SUN_CATCHER_PRICES[size]) {
      return SUN_CATCHER_PRICES[size];
    }
    return DEFAULT_SUN_CATCHER_PRICE;
  }

  return CATEGORY_PRICES[category] || 3500;
}
