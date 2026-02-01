import { clsx, type ClassValue } from 'clsx';

// Tailwind class merge helper
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

// Format cents to dollars
export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);
}

// Format date for display
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// Format date for input fields (YYYY-MM-DD)
export function formatDateForInput(dateString: string): string {
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
}

// Generate order number (BD-YYYY-NNN)
export function generateOrderNumber(year: number, sequence: number): string {
  return `BD-${year}-${String(sequence).padStart(3, '0')}`;
}

// Generate invoice number (BDI-YYYY-NNN)
export function generateInvoiceNumber(year: number, sequence: number): string {
  return `BDI-${year}-${String(sequence).padStart(3, '0')}`;
}

// Get status badge color
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    // Customer statuses
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    pending: 'bg-yellow-100 text-yellow-800',
    // Order statuses
    pending_payment: 'bg-yellow-100 text-yellow-800',
    payment_received: 'bg-blue-100 text-blue-800',
    being_fulfilled: 'bg-indigo-100 text-indigo-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    follow_up: 'bg-orange-100 text-orange-800',
    // Invoice statuses
    draft: 'bg-gray-100 text-gray-800',
    sent: 'bg-blue-100 text-blue-800',
    paid: 'bg-green-100 text-green-800',
    overdue: 'bg-red-100 text-red-800',
    cancelled: 'bg-red-100 text-red-800',
    // Tier levels
    tier1: 'bg-blue-100 text-blue-800',
    tier2: 'bg-purple-100 text-purple-800',
    tier3: 'bg-amber-100 text-amber-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

// Format order status for display
export function formatOrderStatus(status: string): string {
  const labels: Record<string, string> = {
    pending_payment: 'Pending Payment',
    payment_received: 'Payment Received',
    being_fulfilled: 'Being Fulfilled',
    shipped: 'Shipped',
    delivered: 'Delivered',
    follow_up: 'Follow Up',
  };
  return labels[status] || status;
}

// Calculate days until date
export function daysUntil(dateString: string): number {
  const target = new Date(dateString);
  const today = new Date();
  const diffTime = target.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Truncate text
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

// Normalize URL - adds https:// if no protocol specified
export function normalizeUrl(url: string): string {
  if (!url || url.trim() === '') return '';
  let normalized = url.trim();
  if (normalized.match(/^https?:\/\//i)) {
    return normalized;
  }
  return `https://${normalized}`;
}

// Get displayable URL (without protocol)
export function getDisplayUrl(url: string): string {
  if (!url) return '';
  return url.replace(/^https?:\/\//i, '');
}

// Strip common suffixes from product titles for short display
export function makeShortTitle(title: string): string {
  return title
    .replace(/:\s*Stained Glass[- ]Style.*$/i, '')
    .replace(/:\s*Stained Glass.*$/i, '')
    .trim();
}
