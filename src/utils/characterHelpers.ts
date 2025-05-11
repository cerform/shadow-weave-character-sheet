import { Character } from '@/types/character';

/**
 * Gets the initiative bonus for a character
 * @param character The character to get the initiative bonus for
 * @returns The initiative bonus
 */
export const getInitiativeBonus = (character: Character): number => {
  if (!character) return 0;
  
  // Use dexterity modifier as initiative bonus
  const dexterity = character.abilities?.dexterity || character.abilities?.DEX || 10;
  return Math.floor((dexterity - 10) / 2);
};

/**
 * Gets or calculates the initiative value for a character
 * @param character The character to get the initiative for
 * @returns The initiative value or null if not available
 */
export const getInitiative = (character: Character): number | null => {
  if (!character) return null;
  
  // Return initiative if already set
  if (character.initiative !== undefined) return character.initiative;
  
  // Otherwise calculate based on dexterity
  return getInitiativeBonus(character);
};

/**
 * Gets hit dice information for a character
 * @param character The character to get hit dice for
 * @returns An object with hit dice info or undefined if not available
 */
export const getHitDice = (character: Character) => {
  if (!character) return undefined;
  
  if (character.hitDice) return character.hitDice;
  
  // Provide default hit dice based on class if not defined
  const hitDieByClass: Record<string, string> = {
    'барбариан': 'd12',
    'barbarian': 'd12',
    'воин': 'd10',
    'fighter': 'd10',
    'паладин': 'd10',
    'paladin': 'd10',
    'следопыт': 'd10',
    'ranger': 'd10',
    'жрец': 'd8',
    'cleric': 'd8',
    'друид': 'd8',
    'druid': 'd8',
    'монах': 'd8',
    'monk': 'd8',
    'плут': 'd8',
    'rogue': 'd8',
    'колдун': 'd8',
    'warlock': 'd8',
    'бард': 'd8',
    'bard': 'd8',
    'чародей': 'd6',
    'sorcerer': 'd6',
    'волшебник': 'd6',
    'wizard': 'd6'
  };
  
  const characterClass = character.class?.toLowerCase() || '';
  const dieType = hitDieByClass[characterClass] || 'd8';
  
  return {
    total: character.level || 1,
    used: 0,
    dieType: dieType.replace('d', ''),
    value: dieType
  };
};

/**
 * Gets the resources for a character
 * @param character The character to get resources for
 * @returns An object with resources or an empty object if not available
 */
export const getResources = (character: Character): Record<string, { max: number; used: number }> => {
  if (!character) return {};
  
  if (character.resources) return character.resources;
  
  // Default resources based on class if not defined
  const defaultResources: Record<string, { max: number; used: number }> = {};
  
  const characterClass = character.class?.toLowerCase() || '';
  
  if (['бард', 'bard'].includes(characterClass)) {
    defaultResources['Вдохновение'] = { max: Math.max(1, Math.floor((character.abilities?.charisma - 10) / 2)), used: 0 };
  }
  
  if (['чародей', 'sorcerer'].includes(characterClass)) {
    defaultResources['Единицы чародейства'] = { max: character.level, used: 0 };
  }
  
  if (['монах', 'monk'].includes(characterClass)) {
    defaultResources['Ци'] = { max: character.level, used: 0 };
  }
  
  return defaultResources;
};

/**
 * Gets temporary hit points for a character
 * @param character The character to get temp HP for
 * @returns The temporary hit points or 0 if not available
 */
export const getTemporaryHp = (character: Character): number => {
  if (!character) return 0;
  
  return character.tempHp || character.temporaryHp || 0;
};

/**
 * Safely gets the notes for a character
 * @param character The character to get notes for
 * @returns The notes or an empty string if not available
 */
export const getNotes = (character: Character): string => {
  if (!character) return '';
  
  return character.notes || '';
};

/**
 * Safely gets the last dice roll for a character
 * @param character The character to get last dice roll for
 * @returns The last dice roll or undefined if not available
 */
export const getLastDiceRoll = (character: Character) => {
  if (!character) return undefined;
  
  return character.lastDiceRoll;
};
