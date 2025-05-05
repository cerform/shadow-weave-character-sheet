
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
      abilityScore = character.intelligence;
      break;
    case 'wisdom':
    case 'wis':
      abilityScore = character.wisdom;
      break;
    case 'charisma':
    case 'cha':
      abilityScore = character.charisma;
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
      abilityScore = character.intelligence;
      break;
    case 'wisdom':
    case 'wis':
      abilityScore = character.wisdom;
      break;
    case 'charisma':
    case 'cha':
      abilityScore = character.charisma;
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
