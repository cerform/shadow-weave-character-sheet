
/**
 * Safely converts any value to string, handling undefined and null
 * @param value Any value to convert to string
 * @returns String representation or empty string if null/undefined
 */
export const safeToString = (value: any): string => {
  if (value === null || value === undefined) {
    return '';
  }
  return String(value);
};

/**
 * Safely parses JSON string, returning default value if parsing fails
 * @param jsonString JSON string to parse
 * @param defaultValue Default value to return if parsing fails
 * @returns Parsed object or default value
 */
export const safeParseJSON = <T>(jsonString: string, defaultValue: T): T => {
  try {
    return JSON.parse(jsonString) as T;
  } catch (error) {
    return defaultValue;
  }
};

/**
 * Safely creates an ID from a string, removing spaces and special characters
 * @param text Text to convert to ID
 * @returns Safe ID string
 */
export const createSafeId = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/gi, '')
    .replace(/\s+/g, '-');
};

/**
 * Safely truncates a string to a maximum length with ellipsis
 * @param str String to truncate
 * @param maxLength Maximum length
 * @returns Truncated string
 */
export const truncateString = (str: string, maxLength: number): string => {
  if (!str) return '';
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength) + '...';
};
