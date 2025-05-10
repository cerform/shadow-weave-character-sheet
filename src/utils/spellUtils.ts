
import { Character, CharacterSpell } from "@/types/character";

// Check if a spell is already in the character's spell list
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
        name: spell,
        level: 0, // Default to cantrip
        prepared: false
      };
    }
    return spell;
  });
};
