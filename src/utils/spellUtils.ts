
import { Character, CharacterSpell } from '@/types/character';
import { SpellData } from '@/types/spells';
import { calculateAbilityModifier } from './characterUtils';

/**
 * Gets the default spellcasting ability for a given class
 * @param characterClass The character's class
 * @returns The default spellcasting ability
 */
export const getDefaultCastingAbility = (characterClass: string): string => {
  const lowerClass = characterClass.toLowerCase();
  
  if (['чародей', 'бард', 'колдун', 'sorcerer', 'bard', 'warlock'].includes(lowerClass)) {
    return 'charisma';
  } else if (['волшебник', 'wizard'].includes(lowerClass)) {
    return 'intelligence';
  } else if (['жрец', 'друид', 'следопыт', 'cleric', 'druid', 'ranger'].includes(lowerClass)) {
    return 'wisdom';
  }
  
  return 'intelligence'; // Default fallback
};

/**
 * Gets the spellcasting ability modifier for a character
 * @param character The character object
 * @returns The ability modifier
 */
export const getSpellcastingAbilityModifier = (character: Character): number => {
  if (!character) return 0;
  
  const ability = character.spellcasting?.ability || getDefaultCastingAbility(character.class || '');
  
  // Get the appropriate ability score
  let abilityScore = 10;
  
  if (ability === 'strength' && character.abilities) {
    abilityScore = character.abilities.STR || character.abilities.strength || 10;
  } else if (ability === 'dexterity' && character.abilities) {
    abilityScore = character.abilities.DEX || character.abilities.dexterity || 10;
  } else if (ability === 'constitution' && character.abilities) {
    abilityScore = character.abilities.CON || character.abilities.constitution || 10;
  } else if (ability === 'intelligence' && character.abilities) {
    abilityScore = character.abilities.INT || character.abilities.intelligence || 10;
  } else if (ability === 'wisdom' && character.abilities) {
    abilityScore = character.abilities.WIS || character.abilities.wisdom || 10;
  } else if (ability === 'charisma' && character.abilities) {
    abilityScore = character.abilities.CHA || character.abilities.charisma || 10;
  }
  
  return calculateAbilityModifier(abilityScore);
};

/**
 * Calculates the spell save DC for a character
 * @param character The character object
 * @returns The spell save DC
 */
export const calculateSpellcastingDC = (character: Character): number => {
  if (!character) return 8;
  
  const abilityMod = getSpellcastingAbilityModifier(character);
  const profBonus = character.proficiencyBonus || Math.floor((character.level - 1) / 4) + 2;
  
  return 8 + profBonus + abilityMod;
};

/**
 * Calculates the spell attack bonus for a character
 * @param character The character object
 * @returns The spell attack bonus
 */
export const calculateSpellAttackBonus = (character: Character): number => {
  if (!character) return 0;
  
  const abilityMod = getSpellcastingAbilityModifier(character);
  const profBonus = character.proficiencyBonus || Math.floor((character.level - 1) / 4) + 2;
  
  return profBonus + abilityMod;
};

/**
 * Checks if a character can prepare more spells
 * @param character The character object
 * @returns Boolean indicating if character can prepare more spells
 */
export const canPrepareMoreSpells = (character: Character): boolean => {
  const limit = getPreparedSpellsLimit(character);
  
  if (limit <= 0) return true; // No limit
  
  const preparedCount = (character.spells || []).filter(spell => {
    if (typeof spell === 'string') return false;
    return spell.prepared && spell.level > 0; // Excluding cantrips
  }).length;
  
  return preparedCount < limit;
};

/**
 * Gets the maximum number of prepared spells for a character
 * @param character The character object
 * @returns The maximum number of prepared spells
 */
export const getPreparedSpellsLimit = (character: Character): number => {
  if (!character) return 0;
  
  const className = character.class?.toLowerCase() || '';
  const level = character.level || 1;
  
  // Classes that prepare spells
  if (['жрец', 'cleric', 'druid', 'друид', 'wizard', 'волшебник', 'палладин', 'paladin'].includes(className)) {
    const abilityMod = getSpellcastingAbilityModifier(character);
    return Math.max(1, level + abilityMod);
  }
  
  // Classes with spells known
  return 0; // No preparation limit for other classes
};

/**
 * Calculate available spells for a character based on class and level
 */
export const calculateAvailableSpellsByClassAndLevel = (
  characterClass: string,
  level: number,
  abilityModifier: number
) => {
  // Default values
  let maxSpellLevel = 0;
  let cantripsCount = 0;
  let knownSpells = 0;

  const lowerClass = characterClass.toLowerCase();
  
  // Determine spell slots by class and level
  if (['wizard', 'волшебник'].includes(lowerClass)) {
    cantripsCount = level >= 10 ? 5 : level >= 4 ? 4 : 3;
    knownSpells = level + Math.max(1, abilityModifier); // Int mod + level
  } else if (['bard', 'бард'].includes(lowerClass)) {
    cantripsCount = level >= 10 ? 4 : 2;
    knownSpells = level >= 17 ? 22 : level >= 15 ? 19 : level >= 13 ? 16 : level >= 11 ? 15 :
                   level >= 10 ? 14 : level >= 9 ? 13 : level >= 8 ? 11 : level >= 6 ? 9 :
                   level >= 5 ? 8 : level >= 4 ? 7 : level >= 3 ? 6 : level >= 2 ? 5 : 4;
  } else if (['sorcerer', 'чародей'].includes(lowerClass)) {
    cantripsCount = level >= 10 ? 6 : level >= 4 ? 5 : 4;
    knownSpells = level >= 17 ? 15 : level >= 15 ? 14 : level >= 13 ? 13 : level >= 11 ? 12 :
                  level >= 10 ? 11 : level >= 9 ? 10 : level >= 8 ? 9 : level >= 7 ? 8 :
                  level >= 6 ? 7 : level >= 5 ? 6 : level >= 4 ? 5 : level >= 3 ? 4 : level >= 2 ? 3 : 2;
  } else if (['warlock', 'колдун'].includes(lowerClass)) {
    cantripsCount = level >= 10 ? 4 : level >= 4 ? 3 : 2;
    knownSpells = level >= 17 ? 19 : level >= 15 ? 18 : level >= 13 ? 17 : level >= 11 ? 16 :
                  level >= 10 ? 10 : level >= 9 ? 9 : level >= 7 ? 8 : level >= 5 ? 7 :
                  level >= 3 ? 6 : level >= 2 ? 3 : 2;
  } else if (['cleric', 'жрец', 'druid', 'друид'].includes(lowerClass)) {
    cantripsCount = lowerClass === 'druid' || lowerClass === 'друид' ? (level >= 4 ? 3 : 2) : (level >= 10 ? 5 : level >= 4 ? 4 : 3);
    knownSpells = level + Math.max(1, abilityModifier); // Wis mod + level (prepared spells)
  }
  
  // Determine max spell level
  if (level >= 17) maxSpellLevel = 9;
  else if (level >= 15) maxSpellLevel = 8;
  else if (level >= 13) maxSpellLevel = 7;
  else if (level >= 11) maxSpellLevel = 6;
  else if (level >= 9) maxSpellLevel = 5;
  else if (level >= 7) maxSpellLevel = 4;
  else if (level >= 5) maxSpellLevel = 3;
  else if (level >= 3) maxSpellLevel = 2;
  else if (level >= 1) maxSpellLevel = 1;
  
  return {
    maxSpellLevel,
    cantripsCount,
    knownSpells
  };
};

/**
 * Filter spells by class and level
 */
export const filterSpellsByClassAndLevel = (
  spells: SpellData[],
  characterClass: string,
  characterLevel: number
): SpellData[] => {
  if (!spells || !spells.length) return [];
  
  const lowerClass = characterClass.toLowerCase();
  
  // Determine max spell level for this character
  let maxLevel = 0;
  if (characterLevel >= 17) maxLevel = 9;
  else if (characterLevel >= 15) maxLevel = 8;
  else if (characterLevel >= 13) maxLevel = 7;
  else if (characterLevel >= 11) maxLevel = 6;
  else if (characterLevel >= 9) maxLevel = 5;
  else if (characterLevel >= 7) maxLevel = 4;
  else if (characterLevel >= 5) maxLevel = 3;
  else if (characterLevel >= 3) maxLevel = 2;
  else if (characterLevel >= 1) maxLevel = 1;
  
  return spells.filter(spell => {
    // Check if spell level is within character's capability
    if (spell.level > maxLevel) return false;
    
    // Check if spell is available to this class
    if (spell.classes) {
      const spellClasses = Array.isArray(spell.classes) ? spell.classes : [spell.classes];
      return spellClasses.some(cls => cls.toLowerCase().includes(lowerClass));
    }
    
    return false;
  });
};
