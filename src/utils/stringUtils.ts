
/**
 * Converts a string to a URL-friendly slug
 */
export function slugify(text: string): string {
  return `spell-${text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '')}`;
}

/**
 * Safely converts any value to string, handling null and undefined
 */
export function safeToString(value: any): string {
  if (value === null || value === undefined) {
    return '';
  }
  return String(value);
}
