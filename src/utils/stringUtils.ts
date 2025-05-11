
/**
 * Safely converts a value to string
 */
export function safeToString(value: any): string {
  if (value === null || value === undefined) return '';
  return String(value);
}

/**
 * Creates a slug (URL-friendly string) from a given string
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}
