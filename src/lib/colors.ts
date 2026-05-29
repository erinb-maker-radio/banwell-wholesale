// Color variants for masks (Fashion Masks + Plague Doctor Masks).
// All colors are the same price — color is a fulfillment selection only.

export const MASK_COLORS = [
  'Black', 'White', 'Red', 'Orange', 'Yellow',
  'Green', 'Blue', 'Purple', 'Gold', 'Silver',
] as const;

export type MaskColor = (typeof MASK_COLORS)[number];

// Display swatch colors (approximate) for the product-page color picker
export const COLOR_HEX: Record<string, string> = {
  Black: '#1f2937',
  White: '#ffffff',
  Red: '#dc2626',
  Orange: '#ea580c',
  Yellow: '#eab308',
  Green: '#16a34a',
  Blue: '#2563eb',
  Purple: '#9333ea',
  Gold: '#d4af37',
  Silver: '#c0c0c0',
};

export const MASK_CATEGORY_SLUGS = ['plague-doctor-masks', 'fashion-masks'];

// True when a product category (by slug) is a mask that needs a color choice
export function isMaskSlug(slug?: string): boolean {
  return !!slug && MASK_CATEGORY_SLUGS.includes(slug);
}
