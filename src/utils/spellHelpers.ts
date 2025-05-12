

import { CharacterSpell } from '@/types/character';
import { SpellData } from '@/types/spells';

// Normalize spell array that might contain strings or spell objects
export const normalizeSpells = (spells: any[]): CharacterSpell[] => {
  if (!spells || !Array.isArray(spells)) return [];
  
  return spells.map(spell => {
    if (typeof spell === 'string') {
      return {
        name: spell,
        level: 0, // Default to cantrip if unknown
        prepared: true
      };
    }
    return spell;
  });
};

// Check if a spell object is actually a CharacterSpell object or just a string
export const isCharacterSpellObject = (spell: any): spell is CharacterSpell => {
  return typeof spell === 'object' && spell !== null && 'name' in spell;
};

// Get the level of a spell (handles both string and object formats)
export const getSpellLevel = (spell: any): number => {
  if (isCharacterSpellObject(spell)) {
    return spell.level || 0;
  }
  return 0; // Default to cantrip if it's just a string
};

// Check if a spell is prepared
export const isSpellPrepared = (spell: any): boolean => {
  if (isCharacterSpellObject(spell)) {
    return !!spell.prepared;
  }
  return true; // Default to prepared if it's just a string
};

// Get spell level name based on level number
export const getSpellLevelName = (level: number): string => {
  const levelNames = [
    'Заговоры',
    'Заклинания 1 уровня',
    'Заклинания 2 уровня',
    'Заклинания 3 уровня',
    'Заклинания 4 уровня',
    'Заклинания 5 уровня',
    'Заклинания 6 уровня',
    'Заклинания 7 уровня',
    'Заклинания 8 уровня',
    'Заклинания 9 уровня'
  ];
  
  if (level >= 0 && level < levelNames.length) {
    return levelNames[level];
  }
  
  return `Заклинания ${level} уровня`;
};

/**
 * Конвертирует CharacterSpell в SpellData для отображения
 */
export const convertToSpellData = (spell: CharacterSpell | string): SpellData => {
  if (typeof spell === 'string') {
    return {
      id: `spell-${Math.random().toString(36).substring(2, 11)}`,
      name: spell,
      level: 0, // По умолчанию заговор
      school: 'Универсальная',
      castingTime: '1 действие',
      range: 'На себя',
      components: '',
      duration: 'Мгновенная',
      description: '',
      classes: [],
      ritual: false,
      concentration: false,
      verbal: false,
      somatic: false,
      material: false,
      source: 'Custom',
      prepared: true
    };
  }
  
  return {
    id: spell.id?.toString() || `spell-${Math.random().toString(36).substring(2, 11)}`,
    name: spell.name,
    level: spell.level || 0,
    school: spell.school || 'Универсальная',
    castingTime: spell.castingTime || '1 действие',
    range: spell.range || 'На себя',
    components: spell.components || '',
    duration: spell.duration || 'Мгновенная',
    description: spell.description || '',
    classes: spell.classes || [],
    ritual: !!spell.ritual,
    concentration: !!spell.concentration,
    verbal: !!spell.verbal,
    somatic: !!spell.somatic,
    material: !!spell.material,
    materials: spell.materials || '',
    source: spell.source || 'Custom',
    prepared: !!spell.prepared
  };
};

