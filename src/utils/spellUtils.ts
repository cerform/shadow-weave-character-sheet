
import { CharacterSpell } from '@/types/character';
import { SpellData, convertCharacterSpellToSpellData } from '@/types/spells';

// Convert a spell to SpellData format
export const convertToSpellData = (spell: CharacterSpell): SpellData => {
  return {
    id: spell.id || `spell-${spell.name.replace(/\s+/g, '-').toLowerCase()}`,
    name: spell.name,
    level: spell.level,
    school: spell.school || 'Универсальная',
    castingTime: spell.castingTime || '1 действие',
    range: spell.range || 'На себя',
    components: spell.components || '',
    duration: spell.duration || 'Мгновенная',
    description: spell.description || '',
    classes: spell.classes || [],
  };
};

// Normalize spells array to ensure consistent format
export const normalizeSpells = (spells: (CharacterSpell | string)[]): CharacterSpell[] => {
  return spells.map(spell => {
    if (typeof spell === 'string') {
      return {
        id: `spell-${spell.toLowerCase().replace(/\s+/g, '-')}`,
        name: spell,
        level: 0,
        school: 'Универсальная'
      };
    }
    return spell;
  });
};

// Convert spells for state management
export const convertSpellsForState = (spells: CharacterSpell[]): SpellData[] => {
  return spells.map(spell => convertToSpellData(spell));
};

// Get maximum spell level based on character level
export const getMaxSpellLevel = (characterLevel: number): number => {
  if (characterLevel < 3) return 1;
  if (characterLevel < 5) return 2;
  if (characterLevel < 7) return 3;
  if (characterLevel < 9) return 4;
  if (characterLevel < 11) return 5;
  if (characterLevel < 13) return 6;
  if (characterLevel < 15) return 7;
  if (characterLevel < 17) return 8;
  return 9;
};

// Calculate available spells by class and level
export const calculateAvailableSpellsByClassAndLevel = (characterClass: string, characterLevel: number, abilityModifier: number = 0) => {
  const classLower = characterClass.toLowerCase();
  let maxSpellLevel = getMaxSpellLevel(characterLevel);
  let cantripsCount = 0;
  let knownSpells = 0;

  // Calculate cantrips and known spells based on class and level
  if (['волшебник', 'маг'].includes(classLower)) {
    cantripsCount = Math.min(5, 3 + Math.floor((characterLevel - 1) / 9));
    knownSpells = 6 + (characterLevel * 2); // Base formula for prepared spells
  } else if (['бард', 'колдун'].includes(classLower)) {
    cantripsCount = Math.min(4, 2 + Math.floor(characterLevel / 10));
    knownSpells = characterClass === 'бард' ? 
      Math.min(22, 4 + Math.floor(characterLevel * 1.5)) : 
      Math.min(15, 2 + characterLevel);
  } else if (['жрец', 'друид'].includes(classLower)) {
    cantripsCount = Math.min(5, 3 + Math.floor((characterLevel - 1) / 9));
    knownSpells = characterLevel + Math.max(1, abilityModifier);
  } else if (classLower === 'чародей') {
    cantripsCount = Math.min(6, 4 + Math.floor(characterLevel / 10));
    knownSpells = Math.min(15, 2 + Math.floor(characterLevel));
  } else if (classLower === 'паладин' || classLower === 'следопыт') {
    cantripsCount = 0;
    knownSpells = Math.floor(characterLevel / 2) + Math.max(1, abilityModifier);
    maxSpellLevel = Math.min(5, Math.ceil(characterLevel / 8));
  } else {
    cantripsCount = 0;
    knownSpells = 0;
    maxSpellLevel = 0;
  }

  return {
    maxSpellLevel,
    cantripsCount,
    knownSpells
  };
};

// Filter spells by class and level
export const filterSpellsByClassAndLevel = (spells: SpellData[], characterClass: string, maxLevel: number): SpellData[] => {
  const classLower = characterClass.toLowerCase();
  
  return spells.filter(spell => {
    // Check level constraint
    if (spell.level > maxLevel) return false;

    // Check class
    if (!spell.classes) return false;
    
    const classes = Array.isArray(spell.classes) ? 
      spell.classes.map(c => c.toLowerCase()) : 
      [spell.classes.toLowerCase()];
    
    return classes.includes(classLower) ||
      (classLower === 'жрец' && classes.includes('cleric')) ||
      (classLower === 'волшебник' && classes.includes('wizard')) ||
      (classLower === 'друид' && classes.includes('druid')) ||
      (classLower === 'бард' && classes.includes('bard')) ||
      (classLower === 'колдун' && classes.includes('warlock')) ||
      (classLower === 'чародей' && classes.includes('sorcerer')) ||
      (classLower === 'паладин' && classes.includes('paladin')) ||
      (classLower === 'следопыт' && classes.includes('ranger'));
  });
};

// Get spellcasting ability modifier
export const getSpellcastingAbilityModifier = (character: any): number => {
  if (!character || !character.class) return 0;
  
  const classLower = character.class.toLowerCase();
  let abilityScore = 10;
  
  if (['жрец', 'друид'].includes(classLower)) {
    // Wisdom
    abilityScore = character.wisdom || character.abilities?.WIS || character.abilities?.wisdom || 10;
  } else if (['волшебник', 'маг'].includes(classLower)) {
    // Intelligence
    abilityScore = character.intelligence || character.abilities?.INT || character.abilities?.intelligence || 10;
  } else {
    // Charisma (bard, warlock, sorcerer, paladin)
    abilityScore = character.charisma || character.abilities?.CHA || character.abilities?.charisma || 10;
  }
  
  return Math.floor((abilityScore - 10) / 2);
};

// Utility function for applying spell modifiers
export const calculateSpellSaveDC = (proficiencyBonus: number, abilityModifier: number): number => {
  return 8 + proficiencyBonus + abilityModifier;
};

// Calculate spell attack bonus
export const calculateSpellAttackBonus = (proficiencyBonus: number, abilityModifier: number): number => {
  return proficiencyBonus + abilityModifier;
};
