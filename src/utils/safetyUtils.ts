
/**
 * Safely gets the length of an array or returns 0
 */
export const safeArrayLength = <T>(arr: T[] | unknown): number => {
  if (Array.isArray(arr)) {
    return arr.length;
  }
  return 0;
};

/**
 * Safely maps over an array or returns an empty array
 */
export const safeArrayMap = <T, U>(
  arr: T[] | unknown, 
  callback: (value: T, index: number, array: T[]) => U
): U[] => {
  if (Array.isArray(arr)) {
    return arr.map(callback);
  }
  return [];
};

/**
 * Safely checks if a value is greater than another
 */
export const safeGreaterThan = (a: unknown, b: number): boolean => {
  if (typeof a === 'number') {
    return a > b;
  }
  return false;
};

/**
 * Safely checks if a value is less than another
 */
export const safeLessThan = (a: number, b: unknown): boolean => {
  if (typeof b === 'number') {
    return a < b;
  }
  return false;
};

/**
 * Safely gets a nested property from a complex object structure
 */
export const safeGetProperty = <T>(obj: any, path: string, defaultValue: T): T => {
  const keys = path.split('.');
  let current = obj;
  
  for (const key of keys) {
    if (current === null || current === undefined) {
      return defaultValue;
    }
    current = current[key];
  }
  
  return (current === undefined || current === null) ? defaultValue : current as T;
};

/**
 * Safely gets a skill bonus value regardless of the skill format
 */
export const getSkillBonus = (skillValue: boolean | number | { proficient: boolean; expertise: boolean; bonus?: number } | undefined): number => {
  if (typeof skillValue === 'number') {
    return skillValue;
  } else if (typeof skillValue === 'object' && skillValue !== null && 'bonus' in skillValue) {
    return skillValue.bonus || 0;
  }
  return 0;
};

/**
 * Safely determines if equipment is an array or complex object and returns appropriate length
 */
export const getEquipmentLength = (equipment: string[] | { weapons?: string[]; armor?: string; items?: string[]; } | undefined): number => {
  if (!equipment) return 0;
  
  if (Array.isArray(equipment)) {
    return equipment.length;
  }
  
  // If it's an object, sum up the weapons and items arrays lengths
  let count = 0;
  if (equipment.weapons && Array.isArray(equipment.weapons)) {
    count += equipment.weapons.length;
  }
  if (equipment.items && Array.isArray(equipment.items)) {
    count += equipment.items.length;
  }
  if (equipment.armor) {
    count += 1; // Count armor as one item
  }
  
  return count;
};

/**
 * Safely determines if proficiencies is an array or complex object and returns appropriate length
 */
export const getProficienciesLength = (proficiencies: string[] | { armor?: string[]; weapons?: string[]; tools?: string[]; languages?: string[]; } | undefined): number => {
  if (!proficiencies) return 0;
  
  if (Array.isArray(proficiencies)) {
    return proficiencies.length;
  }
  
  // If it's an object, sum up all the arrays lengths
  let count = 0;
  if (proficiencies.armor && Array.isArray(proficiencies.armor)) {
    count += proficiencies.armor.length;
  }
  if (proficiencies.weapons && Array.isArray(proficiencies.weapons)) {
    count += proficiencies.weapons.length;
  }
  if (proficiencies.tools && Array.isArray(proficiencies.tools)) {
    count += proficiencies.tools.length;
  }
  if (proficiencies.languages && Array.isArray(proficiencies.languages)) {
    count += proficiencies.languages.length;
  }
  
  return count;
};
