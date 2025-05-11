
import { Character, CharacterSpell } from '@/types/character';
import { SpellData, convertCharacterSpellToSpellData } from '@/types/spells';
import { getModifier } from './abilityUtils';
import { slugify } from './stringUtils';

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
 * Convert CharacterSpell to SpellData for UI display
 */
export const convertToSpellData = (spell: CharacterSpell | string): SpellData => {
  if (typeof spell === 'string') {
    return {
      id: slugify(spell),
      name: spell,
      level: 0,
      school: 'Универсальная',
      castingTime: '1 действие',
      range: 'На себя',
      components: '',
      duration: 'Мгновенная',
      description: '',
      prepared: false
    };
  }
  
  return {
    id: spell.id || slugify(spell.name),
    name: spell.name,
    level: spell.level,
    school: spell.school || 'Универсальная',
    castingTime: spell.castingTime || '1 действие',
    range: spell.range || 'На себя',
    components: spell.components || '',
    duration: spell.duration || 'Мгновенная',
    description: spell.description || '',
    classes: spell.classes,
    prepared: spell.prepared || false,
    verbal: spell.verbal,
    somatic: spell.somatic,
    material: spell.material,
    ritual: spell.ritual,
    concentration: spell.concentration
  };
};

/**
 * Normalize spells in a character to ensure consistent format
 */
export const normalizeSpells = (character: Character): CharacterSpell[] => {
  if (!character.spells) return [];
  
  return character.spells.map(spell => {
    if (typeof spell === 'string') {
      return {
        id: slugify(spell),
        name: spell,
        level: 0,
        school: 'Универсальная'
      };
    }
    return {
      ...spell,
      id: spell.id || slugify(spell.name)
    };
  });
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
 * Calculate available spells based on class and level
 */
export const calculateAvailableSpellsByClassAndLevel = (
  characterClass: string, 
  level: number,
  abilityModifier: number = 0
): { maxSpellLevel: number, cantripsCount: number, knownSpells: number } => {
  // Default values
  let maxSpellLevel = 0;
  let cantripsCount = 0;
  let knownSpells = 0;

  const classLower = characterClass.toLowerCase();

  // Calculate max spell level
  if (['волшебник', 'чародей', 'бард', 'друид', 'жрец', 'wizard', 'sorcerer', 'bard', 'druid', 'cleric'].includes(classLower)) {
    if (level >= 17) maxSpellLevel = 9;
    else if (level >= 15) maxSpellLevel = 8;
    else if (level >= 13) maxSpellLevel = 7;
    else if (level >= 11) maxSpellLevel = 6;
    else if (level >= 9) maxSpellLevel = 5;
    else if (level >= 7) maxSpellLevel = 4;
    else if (level >= 5) maxSpellLevel = 3;
    else if (level >= 3) maxSpellLevel = 2;
    else if (level >= 1) maxSpellLevel = 1;
  } else if (['паладин', 'следопыт', 'paladin', 'ranger'].includes(classLower)) {
    if (level >= 17) maxSpellLevel = 5;
    else if (level >= 13) maxSpellLevel = 4;
    else if (level >= 9) maxSpellLevel = 3;
    else if (level >= 5) maxSpellLevel = 2;
    else if (level >= 2) maxSpellLevel = 1;
  } else if (['колдун', 'warlock'].includes(classLower)) {
    if (level >= 17) maxSpellLevel = 9;
    else if (level >= 15) maxSpellLevel = 8;
    else if (level >= 13) maxSpellLevel = 7;
    else if (level >= 11) maxSpellLevel = 6;
    else if (level >= 9) maxSpellLevel = 5;
    else if (level >= 7) maxSpellLevel = 4;
    else if (level >= 5) maxSpellLevel = 3;
    else if (level >= 3) maxSpellLevel = 2;
    else if (level >= 1) maxSpellLevel = 1;
  }

  // Calculate cantrips known
  switch (classLower) {
    case 'волшебник':
    case 'wizard':
      cantripsCount = level >= 10 ? 5 : level >= 4 ? 4 : 3;
      knownSpells = level + abilityModifier; // Wizard prepares level + INT spells
      break;
    case 'жрец':
    case 'cleric':
    case 'друид':
    case 'druid':
      cantripsCount = level >= 10 ? 5 : level >= 4 ? 4 : 3;
      knownSpells = level + abilityModifier; // Cleric/druid prepares level + WIS spells
      break;
    case 'бард':
    case 'bard':
      cantripsCount = level >= 10 ? 4 : 2;
      knownSpells = Math.max(4, level + 3); // Bard has known spells
      break;
    case 'колдун':
    case 'warlock':
      cantripsCount = level >= 10 ? 4 : 2;
      knownSpells = Math.min(15, level + 1); // Warlock has known spells
      break;
    case 'чародей':
    case 'sorcerer':
      cantripsCount = level >= 10 ? 6 : level >= 4 ? 5 : 4;
      knownSpells = level + 1; // Sorcerer has known spells
      break;
    default:
      cantripsCount = 0;
      knownSpells = 0;
  }

  return { maxSpellLevel, cantripsCount, knownSpells };
};

/**
 * Converts an array of CharacterSpells to SpellData array for state management
 */
export const convertSpellsForState = (spells: CharacterSpell[]): SpellData[] => {
  return spells.map(spell => convertToSpellData(spell));
};
