
import { Character, CharacterSpell } from '@/types/character';
import { SpellData } from '@/types/spells';
import { getNumericModifier } from '@/utils/characterUtils';

/**
 * Calculate available spells by class and level
 */
export function calculateAvailableSpellsByClassAndLevel(
  className: string, 
  level: number,
  abilityModifier: number = 0
): { maxSpellLevel: number; cantripsCount: number; knownSpells: number } {
  // Maximum spell level based on character level
  let maxSpellLevel = 0;
  if (level >= 1) maxSpellLevel = 1;
  if (level >= 3) maxSpellLevel = 2;
  if (level >= 5) maxSpellLevel = 3;
  if (level >= 7) maxSpellLevel = 4;
  if (level >= 9) maxSpellLevel = 5;
  if (level >= 11) maxSpellLevel = 6;
  if (level >= 13) maxSpellLevel = 7;
  if (level >= 15) maxSpellLevel = 8;
  if (level >= 17) maxSpellLevel = 9;
  
  // Default values
  let cantripsCount = 0;
  let knownSpells = 0;

  const classLower = className.toLowerCase();
  
  // Class-specific spell counts
  switch (classLower) {
    case 'волшебник':
    case 'wizard':
      cantripsCount = level >= 10 ? 5 : level >= 4 ? 4 : 3;
      knownSpells = 6 + (level * 2); // Level 1 starts with 6, +2 per level
      break;
    case 'жрец':
    case 'cleric':
    case 'друид':
    case 'druid':
      cantripsCount = level >= 10 ? 5 : level >= 4 ? 4 : 3;
      knownSpells = level + Math.max(1, abilityModifier); // Wisdom modifier + level
      break;
    case 'бард':
    case 'bard':
      cantripsCount = level >= 10 ? 4 : 2;
      knownSpells = Math.max(4, level + 3); // Starts at 4, increases with level
      break;
    case 'колдун':
    case 'warlock':
      cantripsCount = level >= 10 ? 4 : 2;
      knownSpells = Math.min(15, level + 1); // Starts at 2, increases with level, max 15
      break;
    case 'чародей':
    case 'sorcerer':
      cantripsCount = level >= 10 ? 6 : level >= 4 ? 5 : 4;
      knownSpells = level + 1; // Starts at 2, increases with level
      break;
    case 'паладин':
    case 'paladin':
      cantripsCount = 0; // Paladins don't get cantrips
      knownSpells = Math.floor(level / 2) + Math.max(1, abilityModifier); // Half level + Charisma mod
      maxSpellLevel = Math.min(5, Math.ceil(level / 2)); // Paladins max at 5th level spells
      break;
    case 'следопыт':
    case 'ranger':
      cantripsCount = 0; // Rangers don't get cantrips in the basic rules
      knownSpells = Math.floor(level / 2) + Math.max(1, abilityModifier); // Half level + Wisdom mod
      maxSpellLevel = Math.min(5, Math.ceil(level / 2)); // Rangers max at 5th level spells
      break;
    default:
      maxSpellLevel = 0;
      cantripsCount = 0;
      knownSpells = 0;
  }

  return { maxSpellLevel, cantripsCount, knownSpells };
}

/**
 * Filter spells by class and level
 */
export function filterSpellsByClassAndLevel(spells: SpellData[], className: string, level: number): SpellData[] {
  const { maxSpellLevel } = calculateAvailableSpellsByClassAndLevel(className, level);
  
  return spells.filter(spell => {
    // Check if spell level is available
    if (spell.level > maxSpellLevel) {
      return false;
    }
    
    // Check if spell is available for the character's class
    if (!spell.classes) return false;
    
    const spellClasses = Array.isArray(spell.classes) ? spell.classes : [spell.classes];
    return spellClasses.some(c => 
      typeof c === 'string' && (
        c.toLowerCase() === className.toLowerCase() || 
        c.toLowerCase().includes(className.toLowerCase())
      )
    );
  });
}

/**
 * Get the maximum spell level available for a character
 */
export function getMaxSpellLevel(character: Character): number {
  if (!character || !character.class || !character.level) return 0;
  
  const { maxSpellLevel } = calculateAvailableSpellsByClassAndLevel(
    character.class, 
    character.level
  );
  
  return maxSpellLevel;
}

/**
 * Get the spellcasting ability modifier for a class
 */
export function getSpellcastingAbilityModifier(character: Character): number {
  if (!character.class) return 0;
  
  const classLower = character.class.toLowerCase();
  
  // Интеллект для волшебников
  if (classLower.includes('волшебник') || classLower.includes('wizard')) {
    return getNumericModifier(character.abilities?.intelligence || character.intelligence || 10);
  }
  
  // Мудрость для жрецов, друидов и следопытов
  if (classLower.includes('жрец') || classLower.includes('cleric') || 
      classLower.includes('друид') || classLower.includes('druid') ||
      classLower.includes('следопыт') || classLower.includes('ranger')) {
    return getNumericModifier(character.abilities?.wisdom || character.wisdom || 10);
  }
  
  // Харизма для бардов, чародеев, колдунов и паладинов
  return getNumericModifier(character.abilities?.charisma || character.charisma || 10);
}

/**
 * Get prepared spells limit for classes that prepare spells
 */
export function getPreparedSpellsLimit(character: Character, className: string): number {
  if (!character || !className) return 0;
  
  const classLower = className.toLowerCase();
  let abilityMod = 0;
  
  // Get relevant ability modifier
  if (classLower.includes('волшебник') || classLower.includes('wizard')) {
    abilityMod = getNumericModifier(character.abilities?.intelligence || character.intelligence || 10);
  } else if (classLower.includes('жрец') || classLower.includes('cleric') || 
            classLower.includes('друид') || classLower.includes('druid')) {
    abilityMod = getNumericModifier(character.abilities?.wisdom || character.wisdom || 10);
  } else if (classLower.includes('паладин') || classLower.includes('paladin')) {
    abilityMod = getNumericModifier(character.abilities?.charisma || character.charisma || 10);
  }
  
  // Calculate prepared spells limit
  if (['жрец', 'друид', 'cleric', 'druid'].includes(classLower)) {
    return character.level + abilityMod;
  } else if (['волшебник', 'wizard'].includes(classLower)) {
    return character.level + abilityMod;
  } else if (['паладин', 'paladin'].includes(classLower)) {
    return Math.floor(character.level / 2) + abilityMod;
  }
  
  return 0;
}

/**
 * Check if character can prepare more spells
 */
export function canPrepareMoreSpells(character: Character, className: string): boolean {
  if (!character || !character.spells || !className) return false;
  
  // Get count of currently prepared spells
  const preparedCount = character.spells.filter(spell => {
    if (typeof spell === 'string') return false;
    return spell.prepared && spell.level > 0;
  }).length;
  
  // Get maximum number of prepared spells
  const maxPrepared = getPreparedSpellsLimit(character, className);
  
  return preparedCount < maxPrepared;
}

/**
 * Convert spells to a format that can be stored in character state
 */
export function convertSpellsForState(spells: SpellData[]): CharacterSpell[] {
  return spells.map(spell => ({
    id: spell.id,
    name: spell.name,
    level: spell.level,
    school: spell.school,
    castingTime: spell.castingTime,
    range: spell.range,
    components: spell.components,
    duration: spell.duration,
    description: spell.description,
    classes: spell.classes,
    prepared: spell.prepared || false,
    verbal: spell.verbal,
    somatic: spell.somatic,
    material: spell.material,
    ritual: spell.ritual,
    concentration: spell.concentration
  }));
}

export default {
  calculateAvailableSpellsByClassAndLevel,
  filterSpellsByClassAndLevel,
  getMaxSpellLevel,
  getSpellcastingAbilityModifier,
  getPreparedSpellsLimit,
  canPrepareMoreSpells,
  convertSpellsForState
};
