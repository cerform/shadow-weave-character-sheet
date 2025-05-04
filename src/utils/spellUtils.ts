
import { CharacterSpell } from "@/types/character";
import { SpellData } from "@/hooks/spellbook/types";

/**
 * Safely converts an array of either strings or CharacterSpell objects to CharacterSpell objects
 */
export function normalizeSpells(spells: unknown): CharacterSpell[] {
  if (!spells) return [];
  
  // If it's not an array, return empty array
  if (!Array.isArray(spells)) return [];
  
  // Convert each item in the array to a CharacterSpell object
  return spells.map(spell => {
    if (typeof spell === 'string') {
      // Convert string to basic CharacterSpell object
      return {
        name: spell,
        level: 0,
        school: 'Unknown',
        description: '',
        // Add other required fields with default values
        verbal: false,
        somatic: false,
        material: false,
        prepared: false
      };
    } else if (typeof spell === 'object' && spell !== null) {
      // Already a spell object, return as is
      return spell as CharacterSpell;
    } else {
      // Fall back to a default spell object
      return {
        name: 'Unknown Spell',
        level: 0,
        school: 'Unknown',
        description: '',
        verbal: false,
        somatic: false,
        material: false,
        prepared: false
      };
    }
  });
}

/**
 * Safely joins a string or array of strings with the specified separator
 */
export const safeJoin = (value: string | string[] | undefined, separator: string = ', '): string => {
  if (!value) return '';
  if (Array.isArray(value)) return value.join(separator);
  return value.toString();
};

/**
 * Safely checks if a string array includes a specific value
 */
export const safeIncludes = (array: string | string[] | undefined, value: string): boolean => {
  if (!array) return false;
  if (Array.isArray(array)) return array.includes(value);
  return array === value;
};

/**
 * Safely maps over a string or array of strings
 */
export const safeMap = <T>(
  array: string | string[] | undefined, 
  mapFn: (item: string, index: number) => T
): T[] => {
  if (!array) return [];
  if (Array.isArray(array)) return array.map(mapFn);
  return [mapFn(array, 0)];
};

/**
 * Safely filters a string or array of strings
 */
export const safeFilter = (
  array: string | string[] | undefined, 
  filterFn: (item: string) => boolean
): string[] => {
  if (!array) return [];
  if (Array.isArray(array)) return array.filter(filterFn);
  return filterFn(array) ? [array] : [];
};

/**
 * Safely checks if any element in a string or array of strings matches a condition
 */
export const safeSome = (
  array: string | string[] | undefined, 
  someFn: (item: string) => boolean
): boolean => {
  if (!array) return false;
  if (Array.isArray(array)) return array.some(someFn);
  return someFn(array);
};

/**
 * Extracts spell names from either CharacterSpell objects or strings
 */
export const extractSpellNames = (spells: (CharacterSpell | string)[]): string[] => {
  return spells.map(spell => {
    if (typeof spell === 'string') return spell;
    return spell.name;
  });
};
