
import { Character, CharacterSpell } from '@/types/character';
import { getModifier } from './abilityUtils';

/**
 * Determines default spellcasting ability for a character's class
 */
export const getDefaultCastingAbility = (className: string = ''): 'intelligence' | 'wisdom' | 'charisma' => {
  const classLower = className.toLowerCase();
  
  if (['волшебник', 'wizard', 'artificer', 'искусственник'].includes(classLower)) {
    return 'intelligence';
  } else if (['жрец', 'друид', 'cleric', 'druid', 'ranger', 'следопыт'].includes(classLower)) {
    return 'wisdom';
  } else if (['бард', 'чародей', 'колдун', 'паладин', 'bard', 'sorcerer', 'warlock', 'paladin'].includes(classLower)) {
    return 'charisma';
  }
  
  return 'intelligence'; // Default
};

/**
 * Gets the modifier for a character's spellcasting ability
 */
export const getSpellcastingAbilityModifier = (character: Character): number => {
  const ability = getDefaultCastingAbility(character.class);
  
  if (ability === 'intelligence') {
    return getModifier(character.intelligence);
  } else if (ability === 'wisdom') {
    return getModifier(character.wisdom);
  } else {
    return getModifier(character.charisma);
  }
};

/**
 * Calculates spell save DC for a character
 */
export const calculateSpellcastingDC = (character: Character): number => {
  const abilityModifier = getSpellcastingAbilityModifier(character);
  const proficiencyBonus = character.proficiencyBonus || 2;
  
  return 8 + proficiencyBonus + abilityModifier;
};

/**
 * Calculates spell attack bonus for a character
 */
export const calculateSpellAttackBonus = (character: Character): number => {
  const abilityModifier = getSpellcastingAbilityModifier(character);
  const proficiencyBonus = character.proficiencyBonus || 2;
  
  return proficiencyBonus + abilityModifier;
};

/**
 * Calculate maximum spell level based on character class and level
 */
export const getMaxSpellLevel = (character: Character): number => {
  const { class: className, level } = character;
  const classLower = className.toLowerCase();
  
  // Full casters (wizard, sorcerer, bard, druid, cleric)
  if (['волшебник', 'чародей', 'бард', 'друид', 'жрец', 'wizard', 'sorcerer', 'bard', 'druid', 'cleric'].includes(classLower)) {
    if (level >= 17) return 9;
    if (level >= 15) return 8;
    if (level >= 13) return 7;
    if (level >= 11) return 6;
    if (level >= 9) return 5;
    if (level >= 7) return 4;
    if (level >= 5) return 3;
    if (level >= 3) return 2;
    if (level >= 1) return 1;
  }
  
  // Half casters (paladin, ranger)
  if (['паладин', 'следопыт', 'paladin', 'ranger'].includes(classLower)) {
    if (level >= 17) return 5;
    if (level >= 13) return 4;
    if (level >= 9) return 3;
    if (level >= 5) return 2;
    if (level >= 2) return 1;
    return 0;
  }
  
  // Third casters (eldritch knight, arcane trickster)
  if (['рыцарь-чародей', 'мистический ловкач'].includes(classLower)) {
    if (level >= 19) return 4;
    if (level >= 13) return 3;
    if (level >= 7) return 2;
    if (level >= 3) return 1;
    return 0;
  }

  // Warlock has a special progression
  if (['колдун', 'warlock'].includes(classLower)) {
    if (level >= 17) return 9;
    if (level >= 15) return 8;
    if (level >= 13) return 7;
    if (level >= 11) return 6;
    if (level >= 9) return 5;
    if (level >= 7) return 4;
    if (level >= 5) return 3;
    if (level >= 3) return 2;
    if (level >= 1) return 1;
  }
  
  return 0;
};

/**
 * Calculate number of prepared spells a character can have
 */
export const getPreparedSpellsLimit = (character: Character): number => {
  const { class: className, level } = character;
  const classLower = className.toLowerCase();
  const abilityModifier = getSpellcastingAbilityModifier(character);
  
  // Classes that prepare spells (cleric, druid, paladin, wizard)
  if (['жрец', 'друид', 'паладин', 'волшебник', 'cleric', 'druid', 'paladin', 'wizard'].includes(classLower)) {
    return Math.max(1, level + abilityModifier);
  }
  
  // Classes that know a fixed number of spells
  if (classLower === 'бард' || classLower === 'bard') {
    if (level >= 17) return 22;
    if (level >= 15) return 19;
    if (level >= 13) return 16;
    if (level >= 11) return 15;
    if (level >= 10) return 14;
    if (level >= 6) return 13 - 6 + level; // 13 at level 6, +1 per level
    if (level >= 3) return 6 - 3 + level; // 6 at level 3, +1 per level
    if (level >= 1) return 4;
  }
  
  if (classLower === 'чародей' || classLower === 'sorcerer') {
    if (level >= 17) return 15;
    if (level >= 11) return 12 + Math.floor((level - 11) / 2);
    if (level >= 3) return 4 + Math.floor((level - 3) / 2);
    if (level >= 1) return 2;
  }
  
  if (classLower === 'колдун' || classLower === 'warlock') {
    if (level >= 9) return 15;
    if (level >= 5) return 8 + Math.floor((level - 5) / 2);
    if (level >= 1) return level + 1;
  }
  
  if (classLower === 'следопыт' || classLower === 'ranger') {
    if (level >= 2) return level - 1;
    return 0;
  }
  
  // Default case
  return Math.max(1, level + abilityModifier);
};

/**
 * Check if a character can prepare more spells
 */
export const canPrepareMoreSpells = (character: Character): boolean => {
  if (!character.spells) return true;
  
  const preparedLimit = getPreparedSpellsLimit(character);
  const preparedCount = character.spells.filter(spell => {
    if (typeof spell === 'string') return false;
    return spell.prepared === true;
  }).length;
  
  return preparedCount < preparedLimit;
};

/**
 * Filter spells available by class and level
 */
export const filterSpellsByClassAndLevel = (spells: CharacterSpell[], className: string, maxLevel: number): CharacterSpell[] => {
  return spells.filter(spell => {
    // Filter by level
    if (spell.level > maxLevel) return false;
    
    // Filter by class
    if (Array.isArray(spell.classes)) {
      return spell.classes.some(cls => cls.toLowerCase() === className.toLowerCase());
    } else if (typeof spell.classes === 'string') {
      return spell.classes.toLowerCase() === className.toLowerCase();
    }
    
    return false;
  });
};

/**
 * Get all available spells for a character based on class and level
 */
export const calculateAvailableSpellsByClassAndLevel = (character: Character, allSpells: CharacterSpell[]): CharacterSpell[] => {
  if (!character.class) return [];
  
  const maxLevel = getMaxSpellLevel(character);
  return filterSpellsByClassAndLevel(allSpells, character.class, maxLevel);
};
