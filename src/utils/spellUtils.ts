
import { Character, CharacterSpell } from '@/types/character';
import { SpellData } from '@/types/spells';
import { getAbilityModifier } from './characterUtils';
import { safeToString } from './stringUtils';

// Converting a CharacterSpell to SpellData
export const convertToSpellData = (spell: CharacterSpell): SpellData => {
  return {
    id: spell.id || `spell-${safeToString(spell.name).toLowerCase().replace(/\s+/g, '-')}`,
    name: spell.name,
    level: spell.level || 0,
    school: spell.school || 'Универсальная',
    castingTime: spell.castingTime || '1 действие',
    range: spell.range || 'На себя',
    duration: spell.duration || 'Мгновенная',
    components: spell.components || '',
    description: spell.description || '',
    classes: spell.classes || [],
    ritual: spell.ritual || false,
    concentration: spell.concentration || false,
    verbal: spell.verbal || false,
    somatic: spell.somatic || false,
    material: spell.material || false,
    materials: spell.materials || '',
    source: spell.source || 'PHB',
    higherLevels: spell.higherLevels || spell.higherLevel || '',
  };
};

// Add function for normalizing spells
export const normalizeSpells = (character: Character): CharacterSpell[] => {
  if (!character?.spells) return [];

  return character.spells.map(spell => {
    if (typeof spell === 'string') {
      return {
        id: `spell-${safeToString(spell).toLowerCase().replace(/\s+/g, '-')}`,
        name: spell,
        level: 0,
        school: 'Универсальная',
        prepared: true
      };
    }
    return spell;
  });
};

// Add missing function for calculating max spell level
export const getMaxSpellLevel = (character: Character): number => {
  const { level } = character;
  
  if (level <= 2) return 1;
  if (level <= 4) return 2;
  if (level <= 6) return 3;
  if (level <= 8) return 4;
  if (level <= 10) return 5;
  if (level <= 12) return 6;
  if (level <= 14) return 7;
  if (level <= 16) return 8;
  return 9;
};

// Add missing function for default casting ability
export const getDefaultCastingAbility = (characterClass: string | undefined): string => {
  if (!characterClass) return 'intelligence';
  
  const classLower = characterClass.toLowerCase();
  if (classLower.includes('жрец') || classLower.includes('друид') || 
      classLower.includes('cleric') || classLower.includes('druid')) {
    return 'wisdom';
  } else if (classLower.includes('волшебник') || classLower.includes('wizard')) {
    return 'intelligence';
  } else {
    return 'charisma'; // бард, колдун, чародей, паладин
  }
};

// Add missing function for spell DC calculation
export const calculateSpellcastingDC = (character: Character): number => {
  if (!character?.spellcasting?.ability) return 8;
  
  const abilityMod = getAbilityModifier(character, character.spellcasting.ability);
  const proficiencyBonus = character.proficiencyBonus || 2;
  
  return 8 + abilityMod + proficiencyBonus;
};

// Add missing function for spell attack bonus
export const calculateSpellAttackBonus = (character: Character): number => {
  if (!character?.spellcasting?.ability) return 0;
  
  const abilityMod = getAbilityModifier(character, character.spellcasting.ability);
  const proficiencyBonus = character.proficiencyBonus || 2;
  
  return abilityMod + proficiencyBonus;
};

// Add canPrepareMoreSpells helper
export const canPrepareMoreSpells = (character: Character): boolean => {
  if (!character?.spellcasting) return false;
  
  // Some classes don't prepare spells
  const noPrep = ['чародей', 'колдун', 'бард', 'sorcerer', 'warlock', 'bard'];
  if (character.class && noPrep.some(c => safeToString(character.class).toLowerCase().includes(c))) {
    return true;
  }
  
  const preparedCount = (character.spells || []).filter(s => {
    if (typeof s === 'string') return false;
    return s.prepared;
  }).length;
  
  // Calculate prepared spell limit
  const prepLimit = getPreparedSpellsLimit(character);
  
  return preparedCount < prepLimit;
};

// Add getPreparedSpellsLimit function
export const getPreparedSpellsLimit = (character: Character): number => {
  if (!character?.spellcasting?.ability) return 1;
  
  const abilityMod = getAbilityModifier(character, character.spellcasting.ability);
  const classLevel = character.level || 1;
  
  // Most spellcasters prepare spells equal to their level + ability modifier
  let prepLimit = classLevel + abilityMod;
  
  // Paladin and Ranger prepare half their level + ability modifier
  if (character.class && 
      (safeToString(character.class).toLowerCase().includes('паладин') || 
       safeToString(character.class).toLowerCase().includes('следопыт') ||
       safeToString(character.class).toLowerCase().includes('paladin') ||
       safeToString(character.class).toLowerCase().includes('ranger'))) {
    prepLimit = Math.floor(classLevel / 2) + abilityMod;
  }
  
  // Set a minimum of 1 prepared spell
  return Math.max(1, prepLimit);
};

// Add function to convert spells for state
export const convertSpellsForState = (spells: CharacterSpell[]): SpellData[] => {
  return spells.map(spell => convertToSpellData(spell));
};

// Add utility functions for character creation spell selection
export const getSpellcastingAbilityModifier = (character: Character): number => {
  const className = safeToString(character.class).toLowerCase();
  let abilityScore = 10; // default value
  
  if (className.includes('жрец') || className.includes('друид') ||
      className.includes('cleric') || className.includes('druid')) {
    // Wisdom-based casters
    abilityScore = character.abilities?.WIS || character.abilities?.wisdom || 10;
  } else if (className.includes('волшебник') || className.includes('wizard')) {
    // Intelligence-based casters
    abilityScore = character.abilities?.INT || character.abilities?.intelligence || 10;
  } else {
    // Charisma-based casters (бард, чародей, колдун, паладин)
    abilityScore = character.abilities?.CHA || character.abilities?.charisma || 10;
  }
  
  return Math.floor((abilityScore - 10) / 2);
};

// Add utility function to filter spells by class and level
export const filterSpellsByClassAndLevel = (
  spells: SpellData[],
  characterClass: string,
  level: number
): SpellData[] => {
  const classLower = safeToString(characterClass).toLowerCase();
  const maxSpellLevel = Math.ceil(level / 2); // Approximate max spell level by character level
  
  return spells.filter(spell => {
    // Check if the spell is for this class
    let isForClass = false;
    if (Array.isArray(spell.classes)) {
      isForClass = spell.classes.some(c => 
        safeToString(c).toLowerCase().includes(classLower));
    } else if (typeof spell.classes === 'string') {
      isForClass = safeToString(spell.classes).toLowerCase().includes(classLower);
    }
    
    // Check if the spell level is appropriate
    const isAppropriateLevel = spell.level <= maxSpellLevel;
    
    return isForClass && isAppropriateLevel;
  });
};

// Enhanced version of calculateAvailableSpellsByClassAndLevel that returns maxSpellLevel, cantripsCount, and knownSpells
export const calculateAvailableSpellsByClassAndLevel = (
  characterClass: string, 
  level: number,
  abilityModifier: number = 0
): { maxSpellLevel: number; cantripsCount: number; knownSpells: number } => {
  // Default values
  let cantripsCount = 0;
  let knownSpells = 0;
  let maxSpellLevel = 0;

  // Calculate max spell level based on character level
  if (level >= 1) maxSpellLevel = Math.ceil(level / 2);
  if (maxSpellLevel > 9) maxSpellLevel = 9;
  
  const classLower = safeToString(characterClass).toLowerCase();
  
  // Class-specific spell counts
  switch (true) {
    case classLower.includes('волшебник') || classLower.includes('wizard'):
      cantripsCount = level >= 10 ? 5 : level >= 4 ? 4 : 3;
      knownSpells = 6 + (level * 2); // Level 1 starts with 6, +2 per level
      break;
    case classLower.includes('жрец') || classLower.includes('cleric') ||
         classLower.includes('друид') || classLower.includes('druid'):
      cantripsCount = level >= 10 ? 5 : level >= 4 ? 4 : 3;
      knownSpells = level + abilityModifier; // Level + wisdom modifier
      break;
    case classLower.includes('бард') || classLower.includes('bard'):
      cantripsCount = level >= 10 ? 4 : 2;
      knownSpells = Math.max(4, level + 3); // Starts at 4, increases with level
      break;
    case classLower.includes('колдун') || classLower.includes('warlock'):
      cantripsCount = level >= 10 ? 4 : 2;
      knownSpells = Math.min(15, level + 1); // Starts at 2, increases with level, max 15
      break;
    case classLower.includes('чародей') || classLower.includes('sorcerer'):
      cantripsCount = level >= 10 ? 6 : level >= 4 ? 5 : 4;
      knownSpells = level + 1; // Starts at 2, increases with level
      break;
    default:
      cantripsCount = 0;
      knownSpells = 0;
      maxSpellLevel = 0;
  }

  return { maxSpellLevel, cantripsCount, knownSpells };
};
