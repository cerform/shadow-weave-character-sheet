
/**
 * Safely converts any value to a string
 */
export function safeToString(value: any): string {
  if (value === null || value === undefined) {
    return '';
  }
  
  if (typeof value === 'string') {
    return value;
  }
  
  try {
    return String(value);
  } catch (e) {
    return '';
  }
}

/**
 * Converts a string to a URL-safe slug
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[\s_]+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}
