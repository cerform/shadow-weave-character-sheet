
/**
 * Converts a string to a URL-friendly slug.
 * @param text The string to convert
 * @returns A slug version of the string
 */
export const slugify = (text: string): string => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')     // Replace spaces with -
    .replace(/&/g, '-and-')   // Replace & with 'and'
    .replace(/[^\w\-]+/g, '') // Remove all non-word characters
    .replace(/\-\-+/g, '-')   // Replace multiple - with single -
    .replace(/^-+/, '')       // Trim - from start of text
    .replace(/-+$/, '');      // Trim - from end of text
};

/**
 * Safely converts any value to a string
 * @param value The value to convert
 * @returns A string representation of the value
 */
export const safeToString = (value: any): string => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value);
    } catch (e) {
      return String(value);
    }
  }
  return String(value);
};

/**
 * Capitalizes the first letter of a string
 * @param str The string to capitalize
 * @returns The capitalized string
 */
export const capitalizeFirstLetter = (str: string): string => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Truncates a string to the specified length
 * @param str The string to truncate
 * @param length The maximum length
 * @param suffix The suffix to add to truncated strings
 * @returns The truncated string
 */
export const truncate = (str: string, length: number, suffix: string = '...'): string => {
  if (!str) return '';
  if (str.length <= length) return str;
  return str.substring(0, length) + suffix;
};
