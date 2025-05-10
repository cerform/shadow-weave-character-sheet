
import { Character, CharacterSpell } from '@/types/character';

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

/**
 * Get maximum spell level based on character class and level
 * @param characterClass Character class
 * @param level Character level
 * @returns Maximum spell level
 */
export const getMaxSpellLevel = (characterClass: string, level: number): number => {
  const { maxSpellLevel } = calculateAvailableSpellsByClassAndLevel(characterClass, level);
  return maxSpellLevel;
};

/**
 * Convert CharacterSpell array to SpellData array
 * @param spells Array of character spells
 * @returns Array of SpellData objects
 */
export const convertToSpellData = (spells: (CharacterSpell | string)[]): SpellData[] => {
  return spells.map(spell => {
    if (typeof spell === 'string') {
      return {
        id: spell,
        name: spell,
        level: 0,
        school: 'Unknown',
        castingTime: 'Unknown',
        range: 'Unknown',
        components: 'Unknown',
        duration: 'Unknown',
        description: 'Unknown spell'
      };
    } else {
      return {
        id: spell.id || spell.name,
        name: spell.name,
        level: spell.level,
        school: spell.school || 'Unknown',
        castingTime: spell.castingTime || 'Unknown',
        range: spell.range || 'Unknown',
        components: spell.components || 'Unknown',
        duration: spell.duration || 'Unknown',
        description: spell.description || 'No description available',
        higherLevel: spell.higherLevel,
        higherLevels: spell.higherLevels,
        classes: spell.classes,
        ritual: spell.ritual,
        concentration: spell.concentration,
        verbal: spell.verbal,
        somatic: spell.somatic,
        material: spell.material,
        prepared: spell.prepared,
        source: spell.source
      };
    }
  });
};

/**
 * Normalize spell array to ensure all are CharacterSpell objects
 * @param spells Mixed array of spells
 * @returns Array of CharacterSpell objects
 */
export const normalizeSpells = (spells: (CharacterSpell | string)[]): CharacterSpell[] => {
  return spells.map(spell => {
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
 * Convert spells for state management
 * @param spells SpellData array
 * @returns CharacterSpell array
 */
export const convertSpellsForState = (spells: SpellData[]): CharacterSpell[] => {
  return spells.map(spell => ({
    id: spell.id,
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
