
/**
 * Safely converts any value to a string, handling null, undefined and other types.
 * 
 * @param value - Value to convert to string
 * @returns String representation of the value
 */
export const safeToString = (value: any): string => {
  if (value === null || value === undefined) {
    return '';
  }
  
  if (typeof value === 'string') {
    return value;
  }
  
  // Handle array and object types
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value);
    } catch (e) {
      return Object.prototype.toString.call(value);
    }
  }
  
  // Convert other primitive types
  return String(value);
};

/**
 * Capitalizes the first letter of a string
 * 
 * @param str - String to capitalize
 * @returns Capitalized string
 */
export const capitalize = (str: string): string => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Truncates a string to a specified length and adds an ellipsis
 * 
 * @param str - String to truncate
 * @param length - Maximum length of the string
 * @returns Truncated string with ellipsis if needed
 */
export const truncate = (str: string, length: number): string => {
  if (!str) return '';
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
};
