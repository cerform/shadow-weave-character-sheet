
import { Character, CharacterSpell } from '@/types/character';
import { SpellData } from '@/types/spells';

// Convert SpellData to CharacterSpell
export const convertToCharacterSpell = (spellData: SpellData): CharacterSpell => {
  return {
    name: spellData.name,
    level: spellData.level,
    prepared: spellData.prepared || false,
    castingTime: spellData.castingTime,
    range: spellData.range,
    components: spellData.components,
    duration: spellData.duration,
    school: spellData.school,
    description: spellData.description,
    classes: spellData.classes || [],
    source: spellData.source || 'PHB'
  };
};

// Calculate spell save DC
export const calculateSpellSaveDC = (character: Character, spellcastingAbility: string): number => {
  // Get the ability score
  let abilityScore = 10; // Default
  
  switch (spellcastingAbility.toLowerCase()) {
    case 'intelligence':
    case 'int':
      abilityScore = character.intelligence || 10;
      break;
    case 'wisdom':
    case 'wis':
      abilityScore = character.wisdom || 10;
      break;
    case 'charisma':
    case 'cha':
      abilityScore = character.charisma || 10;
      break;
  }
  
  // Calculate the modifier
  const abilityModifier = Math.floor((abilityScore - 10) / 2);
  
  // Calculate the DC (8 + proficiency + ability modifier)
  return 8 + (character.proficiencyBonus || 2) + abilityModifier;
};

// Calculate spell attack bonus
export const calculateSpellAttackBonus = (character: Character, spellcastingAbility: string): number => {
  // Get the ability score
  let abilityScore = 10; // Default
  
  switch (spellcastingAbility.toLowerCase()) {
    case 'intelligence':
    case 'int':
      abilityScore = character.intelligence || 10;
      break;
    case 'wisdom':
    case 'wis':
      abilityScore = character.wisdom || 10;
      break;
    case 'charisma':
    case 'cha':
      abilityScore = character.charisma || 10;
      break;
  }
  
  // Calculate the modifier
  const abilityModifier = Math.floor((abilityScore - 10) / 2);
  
  // Calculate the attack bonus (proficiency + ability modifier)
  return (character.proficiencyBonus || 2) + abilityModifier;
};

// Get spells by level for a character
export const getSpellsByLevel = (spells: CharacterSpell[]): Record<number, CharacterSpell[]> => {
  const result: Record<number, CharacterSpell[]> = {};
  
  // Initialize all spell levels from 0 to 9
  for (let i = 0; i <= 9; i++) {
    result[i] = [];
  }
  
  // Categorize spells by level
  spells.forEach(spell => {
    if (spell.level >= 0 && spell.level <= 9) {
      result[spell.level].push(spell);
    }
  });
  
  return result;
};

// Sort spells alphabetically
export const sortSpellsAlphabetically = (spells: CharacterSpell[]): CharacterSpell[] => {
  return [...spells].sort((a, b) => a.name.localeCompare(b.name));
};

// Count prepared spells
export const countPreparedSpells = (spells: CharacterSpell[]): number => {
  return spells.filter(spell => spell.prepared).length;
};

// Get spellcasting ability for a class
export const getSpellcastingAbility = (className: string): string => {
  className = className.toLowerCase();
  
  if (['волшебник', 'wizard', 'artificer', 'артифайсер'].includes(className)) {
    return 'intelligence';
  }
  
  if (['жрец', 'cleric', 'друид', 'druid', 'следопыт', 'ranger'].includes(className)) {
    return 'wisdom';
  }
  
  if (['бард', 'bard', 'чародей', 'sorcerer', 'колдун', 'warlock', 'паладин', 'paladin'].includes(className)) {
    return 'charisma';
  }
  
  return 'intelligence'; // Default
};

// Новые функции для исправления ошибок
export const normalizeSpells = (spells: any[]): CharacterSpell[] => {
  if (!spells) return [];
  
  return spells.map(spell => {
    if (typeof spell === 'string') {
      return { name: spell, level: 0 };
    }
    return spell as CharacterSpell;
  });
};

export const convertToSpellData = (spell: CharacterSpell): SpellData => {
  return {
    name: spell.name,
    level: spell.level,
    school: spell.school || 'Универсальная',
    castingTime: spell.castingTime || '1 действие',
    range: spell.range || 'Касание',
    components: spell.components || 'В, С, М',
    duration: spell.duration || 'Мгновенная',
    description: spell.description || '',
    prepared: spell.prepared || false,
    classes: spell.classes || [],
    source: spell.source || 'PHB',
    // Добавляем недостающие поля
    ritual: false,
    concentration: false,
    verbal: true,
    somatic: true,
    material: false,
    higherLevel: '',
    higherLevels: '',
    isRitual: false,
    isConcentration: false
  };
};

export const convertToSpellDataArray = (spells: any[]): SpellData[] => {
  return normalizeSpells(spells).map(spell => convertToSpellData(spell));
};

// Расчет известных заклинаний
export const calculateKnownSpells = (characterClass: string, level: number, abilityScore: number): { cantrips: number; spells: number } => {
  const modifier = typeof abilityScore === 'object' ? 
      Math.floor(((abilityScore.intelligence || 10) - 10) / 2) : 
      Math.floor((abilityScore - 10) / 2);
      
  let cantrips = 0;
  let spells = 0;
  
  switch (characterClass.toLowerCase()) {
    case 'бард':
    case 'bard':
      cantrips = level >= 10 ? 4 : (level >= 4 ? 3 : 2);
      spells = Math.min(level + modifier, 22);
      break;
    case 'жрец':
    case 'cleric':
      cantrips = level >= 10 ? 5 : (level >= 4 ? 4 : 3);
      spells = level + modifier;
      break;
    case 'друид':
    case 'druid':
      cantrips = level >= 4 ? 3 : 2;
      spells = level + modifier;
      break;
    case 'паладин':
    case 'paladin':
      cantrips = 0;
      spells = Math.floor(level / 2) + modifier;
      break;
    case 'следопыт':
    case 'ranger':
      cantrips = 0;
      spells = Math.floor(level / 2) + modifier;
      break;
    case 'волшебник':
    case 'wizard':
      cantrips = level >= 10 ? 5 : (level >= 4 ? 4 : 3);
      spells = level + modifier;
      break;
    case 'чародей':
    case 'sorcerer':
      cantrips = level >= 10 ? 6 : (level >= 4 ? 5 : 4);
      spells = level + 1;
      break;
    case 'колдун':
    case 'warlock':
      cantrips = level >= 10 ? 4 : (level >= 4 ? 3 : 2);
      spells = level + 1;
      break;
    default:
      cantrips = 0;
      spells = 0;
  }
  
  return {
    cantrips: Math.max(0, cantrips),
    spells: Math.max(0, spells)
  };
};

// Добавляем функцию для получения максимального уровня заклинаний
export const getMaxSpellLevel = (level: number): number => {
  if (level <= 0) return 0;
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
