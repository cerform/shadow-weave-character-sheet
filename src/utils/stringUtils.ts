
/**
 * Converts a string to a URL-friendly slug
 */
export function slugify(text: string): string {
  return `spell-${text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '')}`;
}
