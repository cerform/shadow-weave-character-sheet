
/**
 * Safely converts any value to a string
 * @param value The value to convert
 * @returns The string representation of the value
 */
export function safeToString(value: any): string {
  if (value === null || value === undefined) {
    return '';
  }
  
  if (typeof value === 'string') {
    return value;
  }
  
  return String(value);
}

/**
 * Create a URL-friendly slug from a string
 * @param text The string to slugify
 * @returns A lowercase string with spaces and special chars replaced
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
}
