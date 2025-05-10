
import { Character, CharacterSpell } from "@/types/character";
import { SpellData, convertCharacterSpellToSpellData } from "@/types/spells";

// Function to calculate the modifier from an ability score
export const getModifierFromAbilityScore = (abilityScore: number): number => {
  return Math.floor((abilityScore - 10) / 2);
};

// Function to check if a spell is already in the character's spell list
export const isSpellAdded = (character: Character, spellName: string): boolean => {
  if (!character.spells) return false;
  
  return character.spells.some(spell => {
    if (typeof spell === 'string') return spell === spellName;
    return spell.name === spellName;
  });
};

// Get the maximum number of spells a character can prepare based on class and level
export const getPreparedSpellsLimit = (character: Character): number => {
  if (!character) return 0;
  
  const className = character.class.toLowerCase();
  const level = character.level || 1;
  
  // Get the spellcasting ability modifier
  let modifier = 0;
  const abilityScore = getSpellcastingAbilityScore(character);
  modifier = Math.floor((abilityScore - 10) / 2);
  
  // Calculate prepared spells based on class
  switch (className) {
    case 'жрец':
    case 'друид':
    case 'волшебник':
    case 'паладин':
      // Prepared spells = level + ability modifier
      return level + modifier;
    case 'следопыт':
      // Half level (rounded down) + ability modifier
      return Math.floor(level / 2) + modifier;
    case 'бард':
    case 'колдун':
    case 'чародей':
      // These classes don't prepare spells in the same way
      return 0;
    default:
      return 0;
  }
};

// Check if a character can prepare more spells
export const canPrepareMoreSpells = (character: Character): boolean => {
  if (!character || !character.spells) return false;
  
  // Some classes don't prepare spells
  const className = character.class.toLowerCase();
  if (['бард', 'колдун', 'чародей'].includes(className)) {
    return true; // These classes know a fixed number of spells
  }
  
  // Count prepared spells
  const preparedCount = character.spells.filter(spell => {
    if (typeof spell === 'string') return false;
    return spell.prepared;
  }).length;
  
  // Get the limit
  const limit = getPreparedSpellsLimit(character);
  
  return preparedCount < limit;
};

// Get the default spellcasting ability for a class
export const getDefaultCastingAbility = (characterClass: string): string => {
  const className = characterClass.toLowerCase();
  
  switch (className) {
    case 'бард':
      return 'charisma';
    case 'жрец':
    case 'друид':
    case 'следопыт':
      return 'wisdom';
    case 'волшебник':
      return 'intelligence';
    case 'колдун':
    case 'чародей':
    case 'паладин':
      return 'charisma';
    default:
      return 'intelligence';
  }
};

// Get the spellcasting ability score
export const getSpellcastingAbilityScore = (character: Character): number => {
  if (!character) return 10;
  
  const ability = character.spellcasting?.ability || getDefaultCastingAbility(character.class);
  
  switch (ability) {
    case 'intelligence':
      return character.abilities.INT || character.abilities.intelligence || 10;
    case 'wisdom':
      return character.abilities.WIS || character.abilities.wisdom || 10;
    case 'charisma':
      return character.abilities.CHA || character.abilities.charisma || 10;
    default:
      return 10;
  }
};

// Calculate the spell save DC
export const calculateSpellcastingDC = (character: Character): number => {
  if (!character) return 8;
  
  const abilityScore = getSpellcastingAbilityScore(character);
  const abilityMod = Math.floor((abilityScore - 10) / 2);
  const profBonus = character.proficiencyBonus || 2;
  
  return 8 + abilityMod + profBonus;
};

// Calculate the spell attack bonus
export const calculateSpellAttackBonus = (character: Character): number => {
  if (!character) return 0;
  
  const abilityScore = getSpellcastingAbilityScore(character);
  const abilityMod = Math.floor((abilityScore - 10) / 2);
  const profBonus = character.proficiencyBonus || 2;
  
  return abilityMod + profBonus;
};

// Convert a spell list to a standardized format
export const convertSpellList = (spells: (string | CharacterSpell)[]): CharacterSpell[] => {
  return spells.map(spell => {
    if (typeof spell === 'string') {
      return {
        id: `spell-${spell.toLowerCase().replace(/\s+/g, '-')}`,
        name: spell,
        level: 0, // Default to cantrip
        prepared: false
      };
    }
    return {
      ...spell,
      id: spell.id || `spell-${spell.name.toLowerCase().replace(/\s+/g, '-')}`
    };
  });
};

// Added missing utility functions
export const calculateAvailableSpellsByClassAndLevel = (
  characterClass: string,
  level: number,
  abilityModifier: number
): { maxSpellLevel: number, cantripsCount: number, knownSpells: number } => {
  // Default values
  let maxSpellLevel = 0;
  let cantripsCount = 0;
  let knownSpells = 0;

  const classLower = characterClass.toLowerCase();
  
  // Calculate max spell level based on character level
  if (level >= 1) maxSpellLevel = Math.min(9, Math.ceil(level / 2));

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
      knownSpells = level + abilityModifier; // Level + ability modifier
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
      knownSpells = Math.max(0, Math.floor(level / 2) + abilityModifier); // Half level + ability modifier
      break;
    case 'следопыт':
    case 'ranger':
      cantripsCount = 0; // Rangers don't get cantrips in base class
      knownSpells = Math.max(0, Math.floor(level / 2) + abilityModifier); // Half level + ability modifier
      break;
    default:
      cantripsCount = 0;
      knownSpells = 0;
  }

  return { maxSpellLevel, cantripsCount, knownSpells };
};

// Function to filter spells by class and level
export const filterSpellsByClassAndLevel = (
  spells: SpellData[],
  characterClass: string,
  characterLevel: number
): SpellData[] => {
  if (!spells || !Array.isArray(spells)) return [];
  
  const classLower = characterClass.toLowerCase();
  const maxSpellLevel = Math.min(9, Math.ceil(characterLevel / 2));
  
  return spells.filter(spell => {
    // Check if the class can cast this spell
    let isForClass = false;
    
    if (spell.classes) {
      if (Array.isArray(spell.classes)) {
        isForClass = spell.classes.some(cls => 
          cls.toLowerCase() === classLower ||
          (classLower === 'жрец' && cls.toLowerCase() === 'cleric') ||
          (classLower === 'волшебник' && cls.toLowerCase() === 'wizard') ||
          (classLower === 'друид' && cls.toLowerCase() === 'druid') ||
          (classLower === 'бард' && cls.toLowerCase() === 'bard') ||
          (classLower === 'колдун' && cls.toLowerCase() === 'warlock') ||
          (classLower === 'чародей' && cls.toLowerCase() === 'sorcerer') ||
          (classLower === 'паладин' && cls.toLowerCase() === 'paladin') ||
          (classLower === 'следопыт' && cls.toLowerCase() === 'ranger')
        );
      } else if (typeof spell.classes === 'string') {
        isForClass = spell.classes.toLowerCase() === classLower ||
          (classLower === 'жрец' && spell.classes.toLowerCase() === 'cleric') ||
          (classLower === 'волшебник' && spell.classes.toLowerCase() === 'wizard') ||
          (classLower === 'друид' && spell.classes.toLowerCase() === 'druid');
      }
    }
    
    // Check if spell level is available to the character
    const isLevelAvailable = spell.level === 0 || (spell.level <= maxSpellLevel);
    
    return isForClass && isLevelAvailable;
  });
};

// Convert CharacterSpell array for the character's state
export const convertSpellsForState = (spells: CharacterSpell[]): CharacterSpell[] => {
  if (!spells) return [];
  
  return spells.map(spell => ({
    ...spell,
    id: spell.id || `spell-${spell.name.toLowerCase().replace(/\s+/g, '-')}`
  }));
};

// Get maximum spell level based on character level
export const getMaxSpellLevel = (characterLevel: number): number => {
  return Math.min(9, Math.ceil(characterLevel / 2));
};

// Get spellcasting ability modifier
export const getSpellcastingAbilityModifier = (character: Character): number => {
  const score = getSpellcastingAbilityScore(character);
  return Math.floor((score - 10) / 2);
};

// Normalize spells (convert strings to CharacterSpell objects)
export const normalizeSpells = (character: Character): CharacterSpell[] => {
  if (!character.spells) return [];
  
  return character.spells.map(spell => {
    if (typeof spell === 'string') {
      return {
        id: `spell-${spell.toLowerCase().replace(/\s+/g, '-')}`,
        name: spell,
        level: 0,
        prepared: false
      };
    }
    return {
      ...spell,
      id: spell.id || `spell-${spell.name.toLowerCase().replace(/\s+/g, '-')}`
    };
  });
};

// Convert CharacterSpell to SpellData
export const convertToSpellData = (spell: CharacterSpell): SpellData => {
  return {
    id: spell.id || `spell-${spell.name.toLowerCase().replace(/\s+/g, '-')}`,
    name: spell.name,
    level: spell.level,
    school: spell.school || 'Универсальная',
    castingTime: spell.castingTime || '1 действие',
    range: spell.range || 'На себя',
    components: spell.components || '',
    duration: spell.duration || 'Мгновенная',
    description: spell.description || '',
    classes: spell.classes || [],
    prepared: spell.prepared || false
  };
};
