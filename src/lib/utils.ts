/**
 * Format a number as Bangladeshi Taka (BDT) with ৳ symbol and comma separators.
 * Uses the Bangladeshi numbering system (lakh, crore).
 * @example formatPrice(154999) => "৳1,54,999"
 */
export function formatPrice(price: number): string {
  const formatted = price.toLocaleString('en-IN');
  return `৳${formatted}`;
}

/**
 * Calculate discount percentage between original and discounted price.
 * @example formatDiscount(169999, 154999) => "9%"
 */
export function formatDiscount(original: number, discounted: number): string {
  if (original <= 0 || discounted >= original) return '0%';
  const percentage = Math.round(((original - discounted) / original) * 100);
  return `${percentage}%`;
}

/**
 * Generate a URL-friendly slug from a product name or string.
 * @example generateSlug("Samsung Galaxy S25 Ultra") => "samsung-galaxy-s25-ultra"
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-')     // Replace spaces with hyphens
    .replace(/-+/g, '-')      // Collapse multiple hyphens
    .replace(/^-|-$/g, '');   // Trim leading/trailing hyphens
}

/**
 * Truncate text to a maximum length with ellipsis.
 * @example truncateText("Very long text here", 10) => "Very long..."
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + '...';
}
