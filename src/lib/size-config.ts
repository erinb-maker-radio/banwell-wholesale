/**
 * Size configuration for suncatcher products
 * Suncatchers are available in 4 standard sizes
 */

export interface SizeOption {
  inches: number;
  label: string;
  retailPrice: number; // in cents
  description: string;
}

export const SUNCATCHER_SIZES: SizeOption[] = [
  {
    inches: 6,
    label: '6"',
    retailPrice: 7200, // $72
    description: 'Small (6 inch)'
  },
  {
    inches: 10,
    label: '10"',
    retailPrice: 9800, // $98
    description: 'Medium (10 inch)'
  },
  {
    inches: 12,
    label: '12"',
    retailPrice: 11900, // $119
    description: 'Large (12 inch)'
  },
  {
    inches: 15,
    label: '15"',
    retailPrice: 15300, // $153
    description: 'Extra Large (15 inch)'
  }
];

/**
 * Check if a category requires size selection
 */
export function requiresSizeSelection(categoryId: string): boolean {
  return categoryId === 'suncatchers001';
}

/**
 * Get size options for a category
 */
export function getSizeOptions(categoryId: string): SizeOption[] {
  if (requiresSizeSelection(categoryId)) {
    return SUNCATCHER_SIZES;
  }
  return [];
}

/**
 * Get retail price for a suncatcher by size
 */
export function getSuncatcherPrice(inches: number): number {
  const size = SUNCATCHER_SIZES.find(s => s.inches === inches);
  return size?.retailPrice || SUNCATCHER_SIZES[0].retailPrice;
}

/**
 * Format price in cents to dollars
 */
export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}
