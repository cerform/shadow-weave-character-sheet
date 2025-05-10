
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
    components: spell.components || '',
    duration: spell.duration || 'Мгновенная',
    description: spell.description || '',
    classes: spell.classes || [],
    prepared: spell.prepared || false,
    ritual: spell.ritual || false,
    concentration: spell.concentration || false,
    verbal: spell.verbal || false,
    somatic: spell.somatic || false,
    material: spell.material || false,
    materials: spell.materials || '',
    source: spell.source || ''
  };
};

// Converting array of spells for state management
export const convertSpellsForState = (spells: CharacterSpell[]): SpellData[] => {
  return spells.map(spell => convertToSpellData(spell));
};

// Normalizing an array of spells from a character
export const normalizeSpells = (character: Character): CharacterSpell[] => {
  if (!character.spells || !Array.isArray(character.spells)) return [];
  
  return character.spells.map(spell => {
    // If spell is just a string, create a minimal spell object
    if (typeof spell === 'string') {
      return {
        id: `spell-${safeToString(spell).toLowerCase().replace(/\s+/g, '-')}`,
        name: spell,
        level: 0,
        school: 'Универсальная',
        prepared: true
      };
    }
    // If it's already a CharacterSpell object, just ensure it has an ID
    return {
      ...spell,
      id: spell.id || `spell-${safeToString(spell.name).toLowerCase().replace(/\s+/g, '-')}`
    };
  });
};

// Calculate if more spells can be prepared
export const canPrepareMoreSpells = (character: Character): boolean => {
  if (!character) return false;
  const limit = getPreparedSpellsLimit(character);
  
  const preparedCount = (character.spells || [])
    .filter(spell => {
      if (typeof spell === 'string') return false;
      return spell.prepared && spell.level > 0;
    })
    .length;
  
  return preparedCount < limit;
};

// Calculate the limit of prepared spells
export const getPreparedSpellsLimit = (character: Character): number => {
  if (!character || !character.class) return 0;
  
  const classLower = safeToString(character.class).toLowerCase();
  
  // Classes that need to prepare spells
  if (['жрец', 'друид', 'волшебник', 'cleric', 'druid', 'wizard', 'паладин', 'paladin'].includes(classLower)) {
    const abilityMod = classLower === 'волшебник' || classLower === 'wizard' ? 
      getAbilityModifier(character, 'intelligence') : 
      getAbilityModifier(character, 'wisdom');
    
    const level = character.level || 1;
    return Math.max(1, level + abilityMod);
  }
  
  // Classes that don't need to prepare spells
  return 0;
};

// Calculate spellcasting ability modifier based on class
export const getSpellcastingAbilityModifier = (character: Character): number => {
  if (!character || !character.class) return 0;
  
  const classLower = safeToString(character.class).toLowerCase();
  
  if (['жрец', 'друид', 'cleric', 'druid'].includes(classLower)) {
    return getAbilityModifier(character, 'wisdom');
  } 
  else if (['волшебник', 'wizard'].includes(classLower)) {
    return getAbilityModifier(character, 'intelligence');
  }
  else {
    return getAbilityModifier(character, 'charisma');
  }
};

// Filter spells by class and level
export const filterSpellsByClassAndLevel = (
  spells: SpellData[],
  characterClass: string,
  level: number
): SpellData[] => {
  if (!spells || !characterClass) return [];
  
  const maxSpellLevel = Math.ceil(level / 2);
  const classLower = safeToString(characterClass).toLowerCase();
  
  return spells.filter(spell => {
    // Check spell level
    if (spell.level > maxSpellLevel) return false;
    
    // Check if spell is available for class
    if (Array.isArray(spell.classes)) {
      return spell.classes.some(cls => safeToString(cls).toLowerCase().includes(classLower));
    } 
    else if (typeof spell.classes === 'string') {
      return safeToString(spell.classes).toLowerCase().includes(classLower);
    }
    
    return false;
  });
};

// Calculate available spells by class and level
export const calculateAvailableSpellsByClassAndLevel = (
  className: string,
  level: number,
  abilityModifier: number = 0
) => {
  // Default values
  let cantripsCount = 0;
  let knownSpells = 0;
  let maxSpellLevel = Math.max(1, Math.ceil(level / 2));
  
  const classLower = safeToString(className).toLowerCase();
  
  switch(classLower) {
    case 'волшебник':
    case 'wizard':
      cantripsCount = level >= 10 ? 5 : level >= 4 ? 4 : 3;
      knownSpells = 6 + (level * 2);
      break;
      
    case 'жрец':
    case 'cleric':
    case 'друид':
    case 'druid':
      cantripsCount = level >= 10 ? 5 : level >= 4 ? 4 : 3;
      knownSpells = level + Math.max(1, abilityModifier);
      break;
      
    case 'бард':
    case 'bard':
      cantripsCount = level >= 10 ? 4 : 2;
      knownSpells = Math.max(4, level + 3);
      break;
      
    case 'колдун':
    case 'warlock':
      cantripsCount = level >= 10 ? 4 : 2;
      knownSpells = Math.min(15, level + 1);
      break;
      
    case 'чародей':
    case 'sorcerer':
      cantripsCount = level >= 10 ? 6 : level >= 4 ? 5 : 4;
      knownSpells = level + 1;
      break;
      
    case 'паладин':
    case 'paladin':
      cantripsCount = 0;
      knownSpells = Math.ceil(level / 2) + Math.max(1, abilityModifier);
      maxSpellLevel = Math.min(5, Math.ceil(level / 2));
      break;
      
    case 'следопыт':
    case 'ranger':
      cantripsCount = 0;
      knownSpells = Math.ceil(level / 2) + Math.max(1, abilityModifier);
      maxSpellLevel = Math.min(5, Math.ceil(level / 2));
      break;
      
    default:
      cantripsCount = 0;
      knownSpells = 0;
      maxSpellLevel = 0;
  }
  
  return { maxSpellLevel, cantripsCount, knownSpells };
};
