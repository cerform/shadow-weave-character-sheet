
/**
 * Extract spell names from either string or spell object arrays
 */
export const extractSpellNames = (spells: any[]): string[] => {
  return spells.map(spell => {
    if (typeof spell === 'string') return spell;
    return spell.name || '';
  }).filter(Boolean);
};

/**
 * Safe filter function to handle undefined values
 */
export const safeFilter = <T>(array: T[] | undefined, predicate: (value: T) => boolean): T[] => {
  if (!array || !Array.isArray(array)) return [];
  return array.filter(predicate);
};

/**
 * Safe string comparison function for filtering
 */
export const safeSome = (value: string | string[] | undefined, searchTerm: string): boolean => {
  if (!value) return false;
  if (Array.isArray(value)) {
    return value.some(v => 
      v && v.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }
  return value.toLowerCase().includes(searchTerm.toLowerCase());
};

export default {
  extractSpellNames,
  safeFilter,
  safeSome
};
