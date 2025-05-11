
import { Character, CharacterSpell } from '@/types/character';
import { SpellData } from '@/types/spells';
import { generateSpellId } from './spellHelpers';

/**
 * Calculate spell save DC based on character's ability scores
 */
export function calculateSpellSaveDC(character: Character): number {
  const proficiencyBonus = character.proficiencyBonus || Math.floor((character.level + 7) / 4);
  const spellcastingAbilityModifier = getSpellcastingAbilityModifier(character);
  
  return 8 + proficiencyBonus + spellcastingAbilityModifier;
}

/**
 * Calculate spell attack bonus based on character's ability scores
 */
export function calculateSpellAttackBonus(character: Character): number {
  const proficiencyBonus = character.proficiencyBonus || Math.floor((character.level + 7) / 4);
  const spellcastingAbilityModifier = getSpellcastingAbilityModifier(character);
  
  return proficiencyBonus + spellcastingAbilityModifier;
}

/**
 * Get the spellcasting ability modifier for a character
 */
export function getSpellcastingAbilityModifier(character: Character): number {
  const ability = getDefaultCastingAbility(character.class);
  const abilities = character.abilities || character;
  
  switch (ability) {
    case 'intelligence':
      return Math.floor(((abilities.intelligence || abilities.INT || 10) - 10) / 2);
    case 'wisdom':
      return Math.floor(((abilities.wisdom || abilities.WIS || 10) - 10) / 2);
    case 'charisma':
      return Math.floor(((abilities.charisma || abilities.CHA || 10) - 10) / 2);
    default:
      return 0;
  }
}

/**
 * Get default casting ability for a class
 */
export function getDefaultCastingAbility(characterClass?: string): 'intelligence' | 'wisdom' | 'charisma' {
  if (!characterClass) return 'intelligence';
  
  const lowerClass = characterClass.toLowerCase();
  
  // Intelligence-based casters
  if (['волшебник', 'wizard', 'изобретатель', 'artificer'].includes(lowerClass)) {
    return 'intelligence';
  }
  
  // Wisdom-based casters
  if (['жрец', 'cleric', 'друид', 'druid', 'следопыт', 'ranger'].includes(lowerClass)) {
    return 'wisdom';
  }
  
  // Charisma-based casters
  if (['бард', 'bard', 'колдун', 'warlock', 'чародей', 'sorcerer', 'паладин', 'paladin'].includes(lowerClass)) {
    return 'charisma';
  }
  
  return 'intelligence'; // Default
}

/**
 * Calculate available spells by class and level
 */
export function calculateAvailableSpellsByClassAndLevel(characterClass: string, level: number, abilityModifier: number = 0): {
  maxSpellLevel: number;
  cantripsCount: number;
  knownSpells: number;
} {
  const lowerClass = (characterClass || '').toLowerCase();
  
  // Default values
  let maxSpellLevel = 0;
  let cantripsCount = 0;
  let knownSpells = 0;
  
  // Calculate max spell level
  if (level >= 1) {
    maxSpellLevel = Math.min(9, Math.ceil(level / 2));
  }
  
  // Class-specific calculations
  if (['волшебник', 'wizard'].includes(lowerClass)) {
    cantripsCount = level >= 10 ? 5 : level >= 4 ? 4 : 3;
    knownSpells = 6 + (level * 2); // Base spellbook
  } else if (['жрец', 'cleric', 'друид', 'druid'].includes(lowerClass)) {
    cantripsCount = level >= 10 ? 5 : level >= 4 ? 4 : 3;
    knownSpells = level + Math.max(1, abilityModifier); // Level + ability modifier (min 1)
  } else if (['бард', 'bard'].includes(lowerClass)) {
    cantripsCount = level >= 10 ? 4 : 2;
    knownSpells = Math.min(22, level + 3);
  } else if (['колдун', 'warlock'].includes(lowerClass)) {
    cantripsCount = level >= 10 ? 4 : 2;
    knownSpells = Math.min(15, level + 1);
  } else if (['чародей', 'sorcerer'].includes(lowerClass)) {
    cantripsCount = level >= 10 ? 6 : level >= 4 ? 5 : 4;
    knownSpells = level === 1 ? 2 : Math.min(15, level + 1);
  } else if (['паладин', 'paladin', 'следопыт', 'ranger'].includes(lowerClass)) {
    cantripsCount = 0; // No cantrips for these classes
    knownSpells = Math.max(1, Math.floor(level / 2) + abilityModifier); // Half level (rounded down) + ability modifier (min 1)
  } else if (['изобретатель', 'artificer'].includes(lowerClass)) {
    cantripsCount = level >= 10 ? 4 : 2;
    knownSpells = level + Math.max(1, abilityModifier); // Level + Intelligence modifier (min 1)
  }
  
  return { maxSpellLevel, cantripsCount, knownSpells };
}

/**
 * Filter spells by class and level
 */
export function filterSpellsByClassAndLevel(allSpells: SpellData[], characterClass: string, maxLevel: number): SpellData[] {
  const lowerClass = characterClass.toLowerCase();
  
  return allSpells.filter(spell => {
    // Check if spell level is acceptable
    if (spell.level > maxLevel) return false;
    
    // Check if character class can cast this spell
    if (Array.isArray(spell.classes)) {
      return spell.classes.some(c => c.toLowerCase().includes(lowerClass));
    } else if (typeof spell.classes === 'string') {
      return spell.classes.toLowerCase().includes(lowerClass);
    }
    
    return false;
  });
}

/**
 * Check if a character can prepare more spells
 */
export function canPrepareMoreSpells(character: Character, characterClass: string): boolean {
  if (!character || !characterClass) return false;
  
  const lowerClass = characterClass.toLowerCase();
  // Classes that need to prepare spells
  const preparingClasses = ['жрец', 'друид', 'волшебник', 'cleric', 'druid', 'wizard', 'паладин', 'paladin', 'следопыт', 'ranger', 'изобретатель', 'artificer'];
  
  if (!preparingClasses.includes(lowerClass)) {
    return true; // Classes that don't prepare spells can always "prepare" all their spells
  }
  
  const preparedLimit = getPreparedSpellsLimit(character, characterClass);
  const preparedCount = (character.spells || [])
    .filter(s => typeof s !== 'string' && s.prepared && s.level > 0)
    .length;
  
  return preparedCount < preparedLimit;
}

/**
 * Get the limit of prepared spells for a character
 */
export function getPreparedSpellsLimit(character: Character, characterClass: string): number {
  if (!character || !characterClass) return 0;
  
  const lowerClass = characterClass.toLowerCase();
  const level = character.level || 1;
  const abilityModifier = getSpellcastingAbilityModifier(character);
  
  if (['жрец', 'друид', 'cleric', 'druid'].includes(lowerClass)) {
    return level + Math.max(1, abilityModifier);
  } else if (['волшебник', 'wizard'].includes(lowerClass)) {
    return level + Math.max(1, abilityModifier);
  } else if (['паладин', 'paladin', 'следопыт', 'ranger'].includes(lowerClass)) {
    return Math.max(1, Math.floor(level / 2) + abilityModifier);
  } else if (['изобретатель', 'artificer'].includes(lowerClass)) {
    return Math.floor(level / 2) + Math.max(1, abilityModifier);
  }
  
  return 0; // Default for classes that don't prepare spells
}

/**
 * Convert CharacterSpell to SpellData
 */
export function convertToSpellData(spell: CharacterSpell): SpellData {
  return {
    id: spell.id || generateSpellId(spell),
    name: spell.name,
    level: spell.level || 0,
    school: spell.school || 'Универсальная',
    castingTime: spell.castingTime || '1 действие',
    range: spell.range || 'На себя',
    components: spell.components || '',
    duration: spell.duration || 'Мгновенная',
    description: spell.description || '',
    classes: spell.classes || [],
    verbal: spell.verbal || false,
    somatic: spell.somatic || false,
    material: spell.material || false,
    ritual: spell.ritual || false,
    concentration: spell.concentration || false,
    prepared: spell.prepared || false
  };
}

/**
 * Convert an array of spells for state management
 */
export function convertSpellsForState(spells: (CharacterSpell | string)[]): SpellData[] {
  return spells.map(spell => {
    if (typeof spell === 'string') {
      return {
        id: generateSpellId({ name: spell }),
        name: spell,
        level: 0,
        school: 'Универсальная',
        castingTime: '1 действие',
        range: 'На себя',
        components: '',
        duration: 'Мгновенная',
        description: '',
        classes: [],
        verbal: false,
        somatic: false,
        material: false,
        ritual: false,
        concentration: false,
        prepared: false
      };
    }
    return convertToSpellData(spell);
  });
}

/**
 * For compatibility with older code
 */
export const convertSpellArray = convertSpellsForState;

/**
 * Normalize spells for consistency
 */
export function normalizeSpells(spells: (CharacterSpell | string | SpellData)[]): CharacterSpell[] {
  return spells.map(spell => {
    if (typeof spell === 'string') {
      return {
        id: generateSpellId({ name: spell }),
        name: spell,
        level: 0,
        school: 'Универсальная'
      };
    } else {
      return {
        id: spell.id || generateSpellId(spell),
        name: spell.name,
        level: spell.level || 0,
        school: spell.school || 'Универсальная',
        castingTime: (spell as any).castingTime || '1 действие',
        range: (spell as any).range || 'На себя',
        components: (spell as any).components || '',
        duration: (spell as any).duration || 'Мгновенная',
        description: (spell as any).description || '',
        classes: (spell as any).classes || [],
        verbal: (spell as any).verbal || false,
        somatic: (spell as any).somatic || false,
        material: (spell as any).material || false,
        ritual: (spell as any).ritual || false,
        concentration: (spell as any).concentration || false,
        prepared: (spell as any).prepared || false
      };
    }
  });
}
