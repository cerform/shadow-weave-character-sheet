
import { Character } from '@/types/character';

/**
 * Calculates the ability modifier based on the ability score
 * @param abilityScore The ability score (e.g. STR, DEX)
 * @returns The calculated modifier
 */
export const calculateAbilityModifier = (abilityScore: number): number => {
  return Math.floor((abilityScore - 10) / 2);
};

/**
 * Gets the ability score from a character using the ability key
 * @param character The character object
 * @param ability The ability key (e.g. "strength", "STR", etc.)
 * @returns The ability score or 10 as default
 */
export const getAbilityScore = (character: Character, ability: string): number => {
  if (!character.abilities) return 10;
  
  // Handle both short and long format ability names
  switch (ability.toLowerCase()) {
    case 'str':
    case 'strength':
      return character.abilities.STR || character.abilities.strength || 10;
    case 'dex':
    case 'dexterity':
      return character.abilities.DEX || character.abilities.dexterity || 10;
    case 'con':
    case 'constitution':
      return character.abilities.CON || character.abilities.constitution || 10;
    case 'int':
    case 'intelligence':
      return character.abilities.INT || character.abilities.intelligence || 10;
    case 'wis':
    case 'wisdom':
      return character.abilities.WIS || character.abilities.wisdom || 10;
    case 'cha':
    case 'charisma':
      return character.abilities.CHA || character.abilities.charisma || 10;
    default:
      return 10;
  }
};

/**
 * Gets the ability modifier from a character using the ability key
 * @param character The character object
 * @param ability The ability key (e.g. "strength", "STR", etc.)
 * @returns The calculated modifier
 */
export const getAbilityModifier = (character: Character, ability: string): number => {
  const abilityScore = getAbilityScore(character, ability);
  return calculateAbilityModifier(abilityScore);
};

/**
 * Calculates the character's proficiency bonus based on their level
 * @param level The character's level
 * @returns The proficiency bonus
 */
export const calculateProficiencyBonus = (level: number): number => {
  return Math.floor((level - 1) / 4) + 2;
};

/**
 * Gets the character's proficiency bonus
 * @param character The character object
 * @returns The proficiency bonus
 */
export const getProficiencyBonus = (character: Character): number => {
  return character.proficiencyBonus || calculateProficiencyBonus(character.level);
};
