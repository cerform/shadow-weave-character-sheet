
import { getModifier, getModifierFromAbilityScore } from './characterUtils';

/**
 * Get a modifier string from an ability score
 * @param abilityScore The ability score
 * @returns A formatted string with the modifier (e.g. "+3" or "-1")
 */
export const getModifierString = (abilityScore: number): string => {
  const modifier = getModifier(abilityScore);
  return modifier >= 0 ? `+${modifier}` : `${modifier}`;
};

/**
 * Get a numeric modifier from an ability score
 * @param abilityScore The ability score
 * @returns The numeric modifier
 */
export const getModifierValue = (abilityScore: number): number => {
  return getModifierFromAbilityScore(abilityScore);
};

/**
 * Get ability modifier string for a specific ability
 * @param character The character object
 * @param abilityName The name of the ability
 * @returns A formatted string with the modifier
 */
export const getAbilityModifierString = (character: any, abilityName: string): string => {
  const abilityScore = getAbilityScore(character, abilityName);
  return getModifierString(abilityScore);
};

/**
 * Get an ability score from a character
 * @param character The character object
 * @param abilityName The name of the ability
 * @returns The ability score value
 */
export const getAbilityScore = (character: any, abilityName: string): number => {
  if (!character) return 10;
  
  const nameLower = abilityName.toLowerCase();
  
  if (nameLower === 'strength' || nameLower === 'str') {
    return character.strength || character.abilities?.STR || character.abilities?.strength || 10;
  }
  if (nameLower === 'dexterity' || nameLower === 'dex') {
    return character.dexterity || character.abilities?.DEX || character.abilities?.dexterity || 10;
  }
  if (nameLower === 'constitution' || nameLower === 'con') {
    return character.constitution || character.abilities?.CON || character.abilities?.constitution || 10;
  }
  if (nameLower === 'intelligence' || nameLower === 'int') {
    return character.intelligence || character.abilities?.INT || character.abilities?.intelligence || 10;
  }
  if (nameLower === 'wisdom' || nameLower === 'wis') {
    return character.wisdom || character.abilities?.WIS || character.abilities?.wisdom || 10;
  }
  if (nameLower === 'charisma' || nameLower === 'cha') {
    return character.charisma || character.abilities?.CHA || character.abilities?.charisma || 10;
  }
  
  return 10;
};

// Export getModifier since other files need it
export { getModifier } from './characterUtils';
