
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

// Add missing function to calculate available spells by class and level
export const calculateAvailableSpellsByClassAndLevel = (
  characterClass: string, 
  level: number
): { cantrips: number; spells: number } => {
  // Default values
  const result = { cantrips: 0, spells: 0 };
  
  // Convert to lowercase for case-insensitive comparison
  const className = safeToString(characterClass).toLowerCase();
  
  if (className.includes('волшебник') || className.includes('wizard')) {
    result.cantrips = 3 + Math.floor((level - 1) / 9);
    result.spells = 6 + (level * 2);
  } 
  else if (className.includes('жрец') || className.includes('cleric') || 
           className.includes('друид') || className.includes('druid')) {
    result.cantrips = 3 + Math.floor(level / 10);
    result.spells = level + 1;
  }
  else if (className.includes('бард') || className.includes('bard')) {
    result.cantrips = 2 + Math.floor(level / 10);
    result.spells = level + 2;
  }
  else if (className.includes('колдун') || className.includes('warlock')) {
    result.cantrips = 2 + Math.floor((level - 1) / 6);
    result.spells = level + 1;
  }
  else if (className.includes('чародей') || className.includes('sorcerer')) {
    result.cantrips = 4 + Math.floor((level - 1) / 8);
    result.spells = level + 1;
  }
  else if ((className.includes('паладин') || className.includes('paladin')) && level >= 2) {
    result.spells = Math.floor(level / 2) + 1;
  }
  else if ((className.includes('следопыт') || className.includes('ranger')) && level >= 2) {
    result.spells = Math.floor(level / 2) + 1;
  }
  
  return result;
};

// Add canPrepareMoreSpells helper
export const canPrepareMoreSpells = (character: Character): boolean => {
  if (!character?.spellcasting) return false;
  
  // Some classes don't prepare spells
  const noPrep = ['чародей', 'колдун', 'бард', 'sorcerer', 'warlock', 'bard'];
  if (character.class && noPrep.some(c => character.class.toLowerCase().includes(c))) {
    return true;
  }
  
  const preparedCount = (character.spells || []).filter(s => s.prepared).length;
  
  // Calculate prepared spell limit based on class and level
  const abilityMod = getAbilityModifier(character, character.spellcasting.ability || 'intelligence');
  const classLevel = character.level || 1;
  
  // Most spellcasters prepare spells equal to their level + ability modifier
  let prepLimit = classLevel + abilityMod;
  
  // Paladin and Ranger prepare half their level + ability modifier
  if (character.class && 
      (character.class.toLowerCase().includes('паладин') || 
       character.class.toLowerCase().includes('следопыт') ||
       character.class.toLowerCase().includes('paladin') ||
       character.class.toLowerCase().includes('ranger'))) {
    prepLimit = Math.floor(classLevel / 2) + abilityMod;
  }
  
  // Set a minimum of 1 prepared spell
  prepLimit = Math.max(1, prepLimit);
  
  return preparedCount < prepLimit;
};

// Add convertSpellsForState function
export const convertSpellsForState = (spells: CharacterSpell[]): SpellData[] => {
  return spells.map(spell => convertToSpellData(spell));
};
