import { Character, CharacterSpell } from '@/types/character';
import { SpellData } from '@/types/spells';

export interface SpellData {
  id: string;
  name: string;
  level: number;
  school: string;
  castingTime: string;
  range: string;
  components: string;
  duration: string;
  description: string | string[];
  higherLevel?: string;
  higherLevels?: string;
  classes?: string[] | string;
  material?: boolean;
  ritual?: boolean;
  concentration?: boolean;
  verbal?: boolean;
  somatic?: boolean;
  prepared?: boolean;
  source?: string;
}

/**
 * Calculate available spells by class and level
 * @param characterClass The class name
 * @param level The character level
 * @param abilityModifier The spellcasting ability modifier
 * @returns Object with spell limits
 */
export const calculateAvailableSpellsByClassAndLevel = (
  characterClass: string,
  level: number = 1,
  abilityModifier: number = 0
): { maxSpellLevel: number; cantripsCount: number; knownSpells: number } => {
  let maxSpellLevel = 0;
  let cantripsCount = 0;
  let knownSpells = 0;
  
  // Set defaults based on class
  switch(characterClass.toLowerCase()) {
    case 'бард':
      cantripsCount = 2;
      knownSpells = Math.max(1, level + abilityModifier);
      maxSpellLevel = Math.min(Math.ceil(level / 2), 9);
      break;
    case 'волшебник':
      cantripsCount = 3;
      knownSpells = Math.max(1, level + abilityModifier);
      maxSpellLevel = Math.min(Math.ceil(level / 2), 9);
      break;
    case 'жрец':
      cantripsCount = 3;
      knownSpells = Math.max(1, level + abilityModifier);
      maxSpellLevel = Math.min(Math.ceil(level / 2), 9);
      break;
    case 'колдун':
      cantripsCount = 2;
      knownSpells = Math.max(1, Math.min(10, level));
      maxSpellLevel = Math.min(5, Math.ceil(level / 2));
      break;
    case 'следопыт':
      if (level < 2) {
        knownSpells = 0;
        maxSpellLevel = 0;
      } else {
        knownSpells = Math.max(1, Math.floor(level / 2) + abilityModifier);
        maxSpellLevel = Math.min(5, Math.ceil(level / 4));
      }
      break;
    case 'чародей':
      cantripsCount = 4;
      knownSpells = Math.max(1, level + abilityModifier);
      maxSpellLevel = Math.min(Math.ceil(level / 2), 9);
      break;
    case 'паладин':
      if (level < 2) {
        knownSpells = 0;
        maxSpellLevel = 0;
      } else {
        knownSpells = Math.max(1, Math.floor(level / 2) + abilityModifier);
        maxSpellLevel = Math.min(5, Math.ceil(level / 4));
      }
      break;
    case 'друид':
      cantripsCount = 2;
      knownSpells = Math.max(1, level + abilityModifier);
      maxSpellLevel = Math.min(Math.ceil(level / 2), 9);
      break;
    default:
      break;
  }
  
  return { maxSpellLevel, cantripsCount, knownSpells };
};

/**
 * Get maximum spell level based on character class and level
 */
export const getMaxSpellLevel = (characterClass: string, level: number): number => {
  const { maxSpellLevel } = calculateAvailableSpellsByClassAndLevel(characterClass, level);
  return maxSpellLevel;
};

/**
 * Check if a character can prepare more spells
 */
export const canPrepareMoreSpells = (character: Character): boolean => {
  if (!character.spells) return true;
  
  const preparedCount = Array.isArray(character.spells) 
    ? character.spells.filter(spell => {
        if (typeof spell === 'string') return false;
        return spell.prepared;
      }).length 
    : 0;
    
  const limit = getPreparedSpellsLimit(character);
  return preparedCount < limit;
};

/**
 * Get prepared spells limit for a character
 */
export const getPreparedSpellsLimit = (character: Character): number => {
  if (!character.class || !character.level) return 0;
  
  // Get spellcasting ability
  let abilityName = '';
  switch(character.class.toLowerCase()) {
    case 'бард':
    case 'чародей':
    case 'колдун':
    case 'паладин':
      abilityName = 'charisma';
      break;
    case 'жрец':
    case 'друид':
    case 'следопыт':
      abilityName = 'wisdom';
      break;
    case 'волшебник':
      abilityName = 'intelligence';
      break;
    default:
      return 0;
  }
  
  // Get ability modifier
  let abilityScore = 0;
  if (character.abilities) {
    abilityScore = character.abilities[abilityName as keyof typeof character.abilities] as number || 10;
  }
  
  // Calculate modifier
  const modifier = Math.floor((abilityScore - 10) / 2);
  
  // For most classes, it's class level + ability modifier
  return character.level + modifier;
};

/**
 * Normalize spell array to ensure all are CharacterSpell objects
 */
export const normalizeSpells = (character: Character): CharacterSpell[] => {
  if (!character.spells || !Array.isArray(character.spells)) return [];
  
  return character.spells.map(spell => {
    if (typeof spell === 'string') {
      return {
        name: spell,
        level: 0
      };
    }
    return spell;
  });
};

/**
 * Convert CharacterSpell to SpellData
 */
export const convertToSpellData = (spell: CharacterSpell): SpellData => {
  return {
    id: spell.id || `spell-${spell.name.replace(/\s+/g, '-').toLowerCase()}`,
    name: spell.name,
    level: spell.level || 0,
    school: spell.school || 'Универсальная',
    castingTime: spell.castingTime || '1 действие',
    range: spell.range || 'На себя',
    components: spell.components || '',
    duration: spell.duration || 'Мгновенная',
    description: Array.isArray(spell.description) ? spell.description : [spell.description || 'Нет описания'],
    classes: spell.classes || [],
    prepared: spell.prepared || false,
    ritual: spell.ritual || false,
    concentration: spell.concentration || false,
    higherLevels: spell.higherLevels || spell.higherLevel || '',
    higherLevel: spell.higherLevel || spell.higherLevels || '',
    source: spell.source || ''
  };
};

/**
 * Convert spells for state management
 */
export const convertSpellsForState = (spells: SpellData[]): CharacterSpell[] => {
  return spells.map(spell => ({
    id: spell.id?.toString(),
    name: spell.name,
    level: spell.level,
    school: spell.school,
    castingTime: spell.castingTime,
    range: spell.range,
    components: spell.components,
    duration: spell.duration,
    description: spell.description,
    prepared: spell.prepared,
    ritual: spell.ritual,
    concentration: spell.concentration,
    verbal: spell.verbal,
    somatic: spell.somatic,
    material: spell.material,
    higherLevels: spell.higherLevels,
    higherLevel: spell.higherLevel,
    classes: spell.classes,
    source: spell.source
  }));
};

/**
 * Get the spellcasting ability modifier for a character
 * @param character The character object
 * @returns The spellcasting ability modifier
 */
export const getSpellcastingAbilityModifier = (character: Character): number => {
  if (!character.class) return 0;
  
  // Get the appropriate ability for each class
  let ability = '';
  switch(character.class.toLowerCase()) {
    case 'бард':
    case 'чародей':
    case 'колдун':
      ability = 'charisma';
      break;
    case 'жрец':
    case 'друид':
    case 'следопыт':
      ability = 'wisdom';
      break;
    case 'волшебник':
      ability = 'intelligence';
      break;
    case 'паладин':
      ability = 'charisma';
      break;
    default:
      return 0;
  }
  
  // Get the ability score
  const abilityScore = character.abilities?.[ability as keyof typeof character.abilities] || 10;
  
  // Calculate the modifier
  return Math.floor((abilityScore - 10) / 2);
};

/**
 * Filter spells by class and level
 * @param spells List of all spells
 * @param characterClass Character class
 * @param level Character level
 * @returns Filtered spell list
 */
export const filterSpellsByClassAndLevel = (spells: SpellData[], characterClass: string, level: number): SpellData[] => {
  const { maxSpellLevel } = calculateAvailableSpellsByClassAndLevel(characterClass, level);
  
  return spells.filter(spell => {
    // Check if spell is for this class
    const spellClasses = Array.isArray(spell.classes) ? spell.classes : [spell.classes];
    const isForClass = spellClasses.some(cls => cls && cls.toLowerCase() === characterClass.toLowerCase());
    
    // Check if the spell level is valid for the character level
    const validLevel = spell.level <= maxSpellLevel;
    
    return isForClass && validLevel;
  });
};
