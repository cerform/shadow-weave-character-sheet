
/**
 * Safely joins an array of strings or a single string with the provided separator
 * Handles both string and string[] types for compatibility with various APIs
 * 
 * @param value The string or array of strings to join
 * @param separator The separator to use between items (default: ', ')
 * @returns A string representation of the joined values
 */
export function safeJoin(value: string | string[] | undefined, separator: string = ', '): string {
  if (!value) return '';
  
  if (Array.isArray(value)) {
    return value.join(separator);
  }
  
  return String(value);
}

/**
 * Safely filters a string array or a single string
 * 
 * @param value The string or array of strings to filter
 * @param filterFn The filtering function
 * @returns A filtered array
 */
export function safeFilter(value: string | string[] | undefined, filterFn: (item: string) => boolean): string[] {
  if (!value) return [];
  
  if (Array.isArray(value)) {
    return value.filter(filterFn);
  }
  
  return filterFn(value) ? [value] : [];
}

/**
 * Safely checks if a string array or a single string includes a value
 * 
 * @param value The string or array of strings to check
 * @param searchValue The value to search for
 * @returns True if the value is included, false otherwise
 */
export function safeSome(value: string | string[] | undefined, predicate: (item: string) => boolean): boolean {
  if (!value) return false;
  
  if (Array.isArray(value)) {
    return value.some(predicate);
  }
  
  return predicate(value);
}

/**
 * Converts string spells to CharacterSpell objects
 * 
 * @param spells Array of spell names or CharacterSpell objects
 * @returns Array of CharacterSpell objects
 */
export function normalizeSpells(spells: any[] | undefined): any[] {
  if (!spells || !Array.isArray(spells)) return [];
  
  return spells.map(spell => {
    // If spell is already an object with name property
    if (typeof spell === 'object' && spell && spell.name) {
      return spell;
    }
    
    // If spell is a string (spell name)
    if (typeof spell === 'string') {
      return { 
        name: spell,
        level: 0,
        description: "",
        school: "Unknown",
      };
    }
    
    // Fallback for unexpected data
    return { 
      name: "Unknown Spell",
      level: 0,
      description: "",
      school: "Unknown",
    };
  });
}
