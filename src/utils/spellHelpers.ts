
import { Character, CharacterSpell } from '@/types/character';
import { SpellData } from '@/types/spells';

/**
 * Checks if a character can prepare more spells
 * @param character The character to check
 * @param preparedCount The current prepared spell count
 * @returns Whether the character can prepare more spells
 */
export const canPrepareMoreSpells = (character: Character, preparedCount: number): boolean => {
  if (!character) return false;
  
  // Calculate prepared spell limit
  const classLower = character.class?.toLowerCase() || '';
  let abilityScore = 10;
  
  if (['жрец', 'друид', 'cleric', 'druid'].includes(classLower)) {
    // Wisdom-based spellcasters
    abilityScore = character.abilities?.wisdom || character.abilities?.WIS || 10;
  } else if (['волшебник', 'маг', 'wizard'].includes(classLower)) {
    // Intelligence-based spellcasters
    abilityScore = character.abilities?.intelligence || character.abilities?.INT || 10;
  } else if (['паладин', 'paladin'].includes(classLower)) {
    // Charisma-based half-casters
    abilityScore = character.abilities?.charisma || character.abilities?.CHA || 10;
  } else {
    // Other classes don't prepare spells
    return false;
  }
  
  const abilityModifier = Math.floor((abilityScore - 10) / 2);
  const limit = character.level + abilityModifier;
  
  return preparedCount < limit;
};

/**
 * Gets the prepared spell limit for a character
 * @param character The character to check
 * @returns The maximum number of spells that can be prepared
 */
export const getPreparedSpellsLimit = (character: Character): number => {
  if (!character) return 0;
  
  // Calculate prepared spell limit
  const classLower = character.class?.toLowerCase() || '';
  let abilityScore = 10;
  
  if (['жрец', 'друид', 'cleric', 'druid'].includes(classLower)) {
    // Wisdom-based spellcasters
    abilityScore = character.abilities?.wisdom || character.abilities?.WIS || 10;
  } else if (['волшебник', 'маг', 'wizard'].includes(classLower)) {
    // Intelligence-based spellcasters
    abilityScore = character.abilities?.intelligence || character.abilities?.INT || 10;
  } else if (['паладин', 'paladin'].includes(classLower)) {
    // Charisma-based half-casters
    abilityScore = character.abilities?.charisma || character.abilities?.CHA || 10;
  } else {
    // Other classes don't prepare spells
    return 0;
  }
  
  const abilityModifier = Math.floor((abilityScore - 10) / 2);
  return Math.max(1, character.level + abilityModifier);
};

/**
 * Normalizes spell arrays to handle both string and CharacterSpell objects
 * @param spells Array of spells or spell names
 * @returns Normalized array of CharacterSpell objects
 */
export const normalizeSpells = (spells: (CharacterSpell | string)[]): CharacterSpell[] => {
  if (!Array.isArray(spells)) return [];
  
  return spells.map(spell => {
    if (typeof spell === 'string') {
      return { name: spell, level: 0 };
    }
    return spell;
  });
};

/**
 * Converts character spells to SpellData format
 * @param spells Array of spells to convert
 * @returns Array of SpellData objects
 */
export const convertCharacterSpellsToSpellData = (spells: (CharacterSpell | string)[]): SpellData[] => {
  if (!spells || !Array.isArray(spells)) return [];
  
  return spells.map(spell => {
    if (typeof spell === 'string') {
      // If spell is a string, create minimal SpellData object
      return {
        id: `spell-${spell.replace(/\s+/g, '-').toLowerCase()}`,
        name: spell,
        level: 0,
        school: 'Универсальная',
        castingTime: '1 действие',
        range: 'Касание',
        components: '',
        duration: 'Мгновенная',
        description: '',
        classes: [],
      };
    } else {
      // Convert CharacterSpell to SpellData
      return {
        ...spell,
        id: spell.id || `spell-${spell.name.replace(/\s+/g, '-').toLowerCase()}`
      };
    }
  });
};

/**
 * Converts SpellData to CharacterSpell format
 * @param spell SpellData to convert
 * @returns CharacterSpell object
 */
export const convertToSpellData = (spell: CharacterSpell): SpellData => {
  return {
    id: spell.id || `spell-${spell.name.replace(/\s+/g, '-').toLowerCase()}`,
    name: spell.name,
    level: spell.level,
    school: spell.school || 'Универсальная',
    castingTime: spell.castingTime || '1 действие',
    range: spell.range || 'Касание',
    components: spell.components || '',
    duration: spell.duration || 'Мгновенная',
    description: spell.description || '',
    classes: spell.classes || [],
    ritual: spell.ritual || false,
    concentration: spell.concentration || false,
    higher_level: spell.higherLevel || spell.higherLevels || '',
  };
};

/**
 * Gets a formal name for a spell level
 * @param level The spell level (0-9)
 * @returns Formatted level name in Russian
 */
export const getSpellLevelName = (level: number): string => {
  if (level === 0) return 'Заговоры';
  
  const levelSuffix = (() => {
    if (level === 1) return '-го';
    if (level >= 2 && level <= 4) return '-го';
    return '-го';
  })();
  
  return `${level}${levelSuffix} уровня`;
};

/**
 * Checks if a spell is prepared
 * @param spell The spell to check
 * @returns Whether the spell is prepared
 */
export const isSpellPrepared = (spell: CharacterSpell | string): boolean => {
  if (typeof spell === 'string') return false;
  return !!spell.prepared;
};

/**
 * Gets the level of a spell
 * @param spell The spell to check
 * @returns The spell level (0 for cantrips)
 */
export const getSpellLevel = (spell: CharacterSpell | string): number => {
  if (typeof spell === 'string') return 0; // Default to cantrip for string-only spells
  return spell.level || 0;
};

/**
 * Checks if a spell object is a CharacterSpell object (not a string)
 * @param spell The spell to check
 * @returns Whether the spell is a CharacterSpell object
 */
export const isCharacterSpellObject = (spell: CharacterSpell | string): spell is CharacterSpell => {
  return typeof spell !== 'string';
};
