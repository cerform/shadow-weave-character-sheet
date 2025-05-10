
import { Character, CharacterSpell } from '@/types/character';
import { SpellData } from '@/types/spells';

// Function to calculate available spells by class and level
export const calculateAvailableSpellsByClassAndLevel = (
  characterClass: string,
  level: number,
  abilityModifier: number = 0
): { maxSpellLevel: number; cantripsCount: number; knownSpells: number } => {
  const classLower = characterClass.toLowerCase();
  let maxSpellLevel = 0;
  let cantripsCount = 0;
  let knownSpells = 0;

  // Calculate max spell level based on character level
  if (level >= 1) {
    maxSpellLevel = Math.min(9, Math.ceil(level / 2));
  }

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
      knownSpells = Math.max(1, level + abilityModifier); // Level + wisdom modifier
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
      knownSpells = Math.max(1, Math.floor(level / 2) + abilityModifier); // Half level + charisma
      break;
    case 'следопыт':
    case 'ranger':
      cantripsCount = 0; // Rangers don't get cantrips in base rules
      knownSpells = Math.max(1, Math.floor(level / 2) + abilityModifier); // Half level + wisdom
      break;
    default:
      cantripsCount = 0;
      knownSpells = 0;
  }

  return { maxSpellLevel, cantripsCount, knownSpells };
};

// Function to get the spellcasting ability modifier
export const getSpellcastingAbilityModifier = (character: Character): number => {
  const characterClass = character.class.toLowerCase();
  let abilityScore = 10; // Default ability score

  if (['жрец', 'друид', 'следопыт', 'cleric', 'druid', 'ranger'].includes(characterClass)) {
    // Use WIS
    abilityScore = character.abilities.WIS || character.abilities.wisdom || character.wisdom || 10;
  } else if (['волшебник', 'artificer', 'wizard'].includes(characterClass)) {
    // Use INT
    abilityScore = character.abilities.INT || character.abilities.intelligence || character.intelligence || 10;
  } else {
    // Use CHA (bard, sorcerer, warlock, paladin)
    abilityScore = character.abilities.CHA || character.abilities.charisma || character.charisma || 10;
  }

  return Math.floor((abilityScore - 10) / 2);
};

// Function to get spellcasting ability score name
export const getSpellcastingAbilityScore = (characterClass: string): string => {
  const classLower = characterClass.toLowerCase();
  
  if (['жрец', 'друид', 'следопыт', 'cleric', 'druid', 'ranger'].includes(classLower)) {
    return 'wisdom';
  } else if (['волшебник', 'artificer', 'wizard'].includes(classLower)) {
    return 'intelligence';
  } else {
    return 'charisma';
  }
};

// Function to filter spells by class and level
export const filterSpellsByClassAndLevel = (
  spells: SpellData[],
  characterClass: string,
  characterLevel: number
): SpellData[] => {
  const maxLevel = getMaxSpellLevel(characterLevel);
  const classLower = characterClass.toLowerCase();
  
  return spells.filter(spell => {
    // Check if spell is within character's level range
    if (spell.level > maxLevel) return false;
    
    // Check if spell is available for character's class
    if (spell.classes) {
      if (Array.isArray(spell.classes)) {
        return spell.classes.some(cls => cls.toLowerCase() === classLower);
      } else {
        return spell.classes.toLowerCase() === classLower;
      }
    }
    
    return false;
  });
};

// Function to get max spell level based on character level
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

// Function to convert spells for state management
export const convertSpellsForState = (spells: CharacterSpell[]): SpellData[] => {
  return spells.map(spell => ({
    id: spell.id || `spell-${spell.name.toLowerCase().replace(/\s+/g, '-')}`,
    name: spell.name,
    level: spell.level,
    school: spell.school || 'Универсальная',
    castingTime: spell.castingTime || '1 действие',
    range: spell.range || 'На себя',
    components: spell.components || '',
    duration: spell.duration || 'Мгновенная',
    description: spell.description || '',
    prepared: spell.prepared || false,
    classes: spell.classes || []
  }));
};

// Function to normalize spells (ensure they have all required properties)
export const normalizeSpells = (spells: (CharacterSpell | string)[]): CharacterSpell[] => {
  return spells.map(spell => {
    if (typeof spell === 'string') {
      return {
        id: `spell-${spell.toLowerCase().replace(/\s+/g, '-')}`,
        name: spell,
        level: 0,
        school: 'Универсальная',
        castingTime: '1 действие',
        range: 'На себя',
        components: '',
        duration: 'Мгновенная',
        description: '',
      };
    }
    
    return {
      ...spell,
      id: spell.id || `spell-${spell.name.toLowerCase().replace(/\s+/g, '-')}`,
      school: spell.school || 'Универсальная',
      castingTime: spell.castingTime || '1 действие',
      range: spell.range || 'На себя',
      components: spell.components || '',
      duration: spell.duration || 'Мгновенная',
      description: spell.description || ''
    };
  });
};

// Function to convert to SpellData
export const convertToSpellData = (spell: CharacterSpell | string): SpellData => {
  if (typeof spell === 'string') {
    return {
      id: `spell-${spell.toLowerCase().replace(/\s+/g, '-')}`,
      name: spell,
      level: 0,
      school: 'Универсальная',
      castingTime: '1 действие',
      range: 'На себя',
      components: '',
      duration: 'Мгновенная',
      description: ''
    };
  }
  
  return {
    id: spell.id || `spell-${spell.name.toLowerCase().replace(/\s+/g, '-')}`,
    name: spell.name,
    level: spell.level,
    school: spell.school || 'Универсальная',
    castingTime: spell.castingTime || '1 действие',
    range: spell.range || 'На себя',
    components: spell.components || '',
    duration: spell.duration || 'Мгновенная',
    description: spell.description || ''
  };
};

// Function to check if a character can prepare more spells
export const canPrepareMoreSpells = (character: Character): boolean => {
  const preparedCount = character.spells?.filter(s => {
    if (typeof s === 'string') return false;
    return s.prepared;
  }).length || 0;
  
  const limit = getPreparedSpellsLimit(character);
  return preparedCount < limit;
};

// Function to get the prepared spells limit
export const getPreparedSpellsLimit = (character: Character): number => {
  const abilityModifier = getSpellcastingAbilityModifier(character);
  return Math.max(1, character.level + abilityModifier);
};

// Function to check if a spell is already added to a character
export const isSpellAdded = (character: Character, spellName: string): boolean => {
  return character.spells?.some(s => {
    if (typeof s === 'string') return s === spellName;
    return s.name === spellName;
  }) || false;
};
