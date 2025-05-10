
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

/**
 * Creates a default character with minimal required properties
 * @returns A new default character object
 */
export const createDefaultCharacter = (): Character => {
  return {
    id: `temp_${Date.now()}`,
    name: '',
    race: '',
    class: '',
    level: 1,
    background: '',
    alignment: '',
    abilities: {
      STR: 10,
      DEX: 10,
      CON: 10,
      INT: 10,
      WIS: 10,
      CHA: 10,
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10
    },
    maxHp: 0,
    hp: 0,
    temporaryHp: 0,
    ac: 0,
    proficiencyBonus: 2,
    speed: 30,
    initiative: 0,
    inspiration: false,
    hitDice: {
      total: 1,
      used: 0,
      dieType: 'd8'
    },
    resources: {},
    deathSaves: {
      successes: 0,
      failures: 0
    },
    spellcasting: {
      ability: '',
      dc: 0,
      attack: 0
    },
    spellSlots: {},
    spells: [],
    equipment: {
      weapons: [],
      armor: '',
      items: [],
      gold: 0
    },
    proficiencies: {
      languages: [],
      tools: []
    },
    features: [],
    notes: '',
    savingThrows: {
      STR: 0,
      DEX: 0,
      CON: 0,
      INT: 0,
      WIS: 0,
      CHA: 0
    },
    skills: {},
    xp: 0
  };
};

/**
 * Gets the modifier from ability score with sign (+ or -)
 * @param score The ability score
 * @returns The modifier with sign
 */
export const getModifierFromAbilityScore = (score: number): number => {
  return Math.floor((score - 10) / 2);
};

/**
 * Gets the modifier as a string with a + sign for positive values
 * @param modifier The numeric modifier
 * @returns The modifier as a formatted string
 */
export const getNumericModifier = (modifier: number): string => {
  return modifier >= 0 ? `+${modifier}` : `${modifier}`;
};
