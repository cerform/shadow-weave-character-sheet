
/**
 * Safely converts any value to a string, even if it's a "never" type
 * This helps avoid TypeScript errors with "Property 'toLowerCase' does not exist on type 'never'"
 */
export const safeToString = (value: any): string => {
  if (value === null || value === undefined) return '';
  return String(value);
};
