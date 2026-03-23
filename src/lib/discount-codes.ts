// Monthly rotating discount codes for Banwell Designs
//
// OVERLAP STRATEGY:
// - The subscriber system sends the current month's code.
// - Each code is valid in Etsy for 6 weeks (the full month + 15 days into the next).
// - This gives late-month subscribers at least 2 weeks to use their code.
//
// Example timeline:
//   Mar 1-31:  subscribers receive VELVETKITE     (valid in Etsy until Apr 15)
//   Apr 1-30:  subscribers receive COPPERFERN      (valid in Etsy until May 15)
//   Apr 1-15:  VELVETKITE still works (overlap window for March subscribers)
//
// Create these codes in ALL 3 Etsy shops with 25% off and the Etsy expiration dates
// shown in discount-codes.html.

interface MonthlyCode {
  code: string;
  year: number;
  month: number; // 1-12
}

const MONTHLY_CODES: MonthlyCode[] = [
  { code: 'VELVETKITE',     year: 2026, month: 3 },  // Mar — Etsy expiry: Apr 15
  { code: 'COPPERFERN',     year: 2026, month: 4 },  // Apr — Etsy expiry: May 15
  { code: 'MOSSYLANTERN',   year: 2026, month: 5 },  // May — Etsy expiry: Jun 15
  { code: 'AMBERTHISTLE',   year: 2026, month: 6 },  // Jun — Etsy expiry: Jul 15
  { code: 'CORALDRIFTWOOD', year: 2026, month: 7 },  // Jul — Etsy expiry: Aug 15
  { code: 'WILLOWSPARK',    year: 2026, month: 8 },  // Aug — Etsy expiry: Sep 15
  { code: 'RUSTICPLUME',    year: 2026, month: 9 },  // Sep — Etsy expiry: Oct 15
  { code: 'COBALTWREN',     year: 2026, month: 10 }, // Oct — Etsy expiry: Nov 15
  { code: 'TIMBERGLOW',     year: 2026, month: 11 }, // Nov — Etsy expiry: Dec 15
  { code: 'FROSTCEDAR',     year: 2026, month: 12 }, // Dec — Etsy expiry: Jan 15
  { code: 'INDIGORIDGE',    year: 2027, month: 1 },  // Jan — Etsy expiry: Feb 15
  { code: 'CRIMSONBLOOM',   year: 2027, month: 2 },  // Feb — Etsy expiry: Mar 15
];

// Special codes with custom discount percentages
const SPECIAL_CODES: Record<string, number> = {
  'ERIN90': 90,
};

// Legacy code that was sent before the rotation system
const LEGACY_CODES = ['WELCOME25'];

/**
 * Get the currently active discount code based on today's date.
 * The system sends ONE code per month. Overlap is handled by Etsy expiration dates
 * (each code stays valid in Etsy for 15 days past its month).
 */
export function getCurrentCode(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // getMonth() is 0-indexed

  const match = MONTHLY_CODES.find(c => c.year === year && c.month === month);
  if (match) return match.code;

  // If past all scheduled codes, use the last one
  // (Add more codes before this happens!)
  return MONTHLY_CODES[MONTHLY_CODES.length - 1].code;
}

/**
 * Check if a code is valid (any monthly code or legacy code).
 * Actual expiration is enforced by Etsy — we just confirm it's a real code.
 */
export function isValidCode(code: string): boolean {
  const upper = code.toUpperCase();

  if (LEGACY_CODES.includes(upper)) return true;
  if (upper in SPECIAL_CODES) return true;

  return MONTHLY_CODES.some(c => c.code === upper);
}

/**
 * Get the discount percentage for a code. Special codes may have custom percentages.
 * Default is 25% for monthly/legacy codes.
 */
export function getCodeDiscount(code: string): number {
  const upper = code.toUpperCase();
  if (upper in SPECIAL_CODES) return SPECIAL_CODES[upper];
  return 25;
}

/**
 * Get all codes for reference (e.g., admin dashboard).
 */
export function getAllCodes() {
  return { monthly: MONTHLY_CODES, legacy: LEGACY_CODES };
}
