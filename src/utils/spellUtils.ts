import { CharacterSpell } from "@/types/character";
import { SpellData } from "@/types/spells";
import { componentsToString } from "./spellProcessors";

/**
 * Converts character spells to SpellData format
 * @param spells Array of character spells
 * @returns Array of SpellData
 */
export function convertSpellsForState(spells: CharacterSpell[]): SpellData[] {
  return spells.map(spell => ({
    id: spell.id,
    name: spell.name,
    level: spell.level,
    school: spell.school,
    castingTime: spell.castingTime || "1 действие",
    range: spell.range || "На себя",
    components: spell.components || "",
    duration: spell.duration || "Мгновенная",
    description: spell.description || "",
    ritual: spell.ritual || false,
    concentration: spell.concentration || false,
    verbal: spell.verbal || false,
    somatic: spell.somatic || false,
    material: spell.material || false,
    classes: spell.classes || []
  }));
}

/**
 * Normalizes spells from any format to CharacterSpell[]
 */
export function normalizeSpells(spells: (CharacterSpell | string)[]): CharacterSpell[] {
  if (!spells) return [];
  
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
}

/**
 * Converts a spell to SpellData format
 */
export function convertToSpellData(spell: CharacterSpell): SpellData {
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
    verbal: spell.verbal || false,
    somatic: spell.somatic || false,
    material: spell.material || false,
    ritual: spell.ritual || false,
    concentration: spell.concentration || false,
    prepared: spell.prepared || false
  };
}

/**
 * Determines the maximum spell level based on character class and level
 */
export function getMaxSpellLevel(characterClass: string, level: number): number {
  // Default spellcasting progression
  const fullCasterProgression = [0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 9];
  const halfCasterProgression = [0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5];
  
  // Define classes by their spellcasting progression
  const fullCasters = ["маг", "волшебник", "чародей", "колдун", "жрец", "друид", "бард",
                       "wizard", "sorcerer", "warlock", "cleric", "druid", "bard"];
                       
  const halfCasters = ["паладин", "следопыт", "ranger", "paladin"];
  
  const classLower = characterClass.toLowerCase();
  
  if (fullCasters.some(c => classLower.includes(c))) {
    return fullCasterProgression[Math.min(level, 20)];
  } else if (halfCasters.some(c => classLower.includes(c))) {
    return halfCasterProgression[Math.min(level, 20)];
  }
  
  return 0;
}

/**
 * Calculates the number of spells a character can prepare
 */
export function getPreparedSpellsLimit(characterClass: string, level: number, modifier: number): number {
  const classLower = characterClass.toLowerCase();
  
  // Classes that prepare spells equal to class level + ability modifier
  const preparingClasses = ["жрец", "друид", "волшебник", "cleric", "druid", "wizard"];
  
  // Classes that know a fixed number of spells
  const knownSpellClasses = ["бард", "чародей", "колдун", "bard", "sorcerer", "warlock"];
  
  if (preparingClasses.some(c => classLower.includes(c))) {
    return Math.max(1, level + modifier);
  } else if (knownSpellClasses.some(c => classLower.includes(c))) {
    // This would need to be implemented based on the specific class rules
    // For now, returning a basic formula
    return Math.max(1, level + Math.floor(modifier / 2));
  }
  
  return 0;
}

/**
 * Checks if a character can prepare more spells
 */
export function canPrepareMoreSpells(character: any, preparedCount: number): boolean {
  if (!character || !character.class) return false;
  
  const characterClass = character.class.toLowerCase();
  const level = character.level || 1;
  
  // For characters that don't prepare spells (like Sorcerers, Bards)
  const nonPreparingClasses = ["чародей", "бард", "колдун", "sorcerer", "bard", "warlock"];
  if (nonPreparingClasses.some(c => characterClass.includes(c))) {
    return true; // They can "prepare" (know) all their spells
  }
  
  // Calculate the spellcasting ability modifier
  const abilityModifier = getSpellcastingAbilityModifier(character);
  
  // Calculate the limit
  const limit = getPreparedSpellsLimit(character.class, level, abilityModifier);
  
  return preparedCount < limit;
}

/**
 * Gets the spellcasting ability modifier for a character
 */
export function getSpellcastingAbilityModifier(character: any): number {
  if (!character || !character.abilities) return 0;
  
  const characterClass = character.class?.toLowerCase() || '';
  
  // Intelligence-based casters
  if (characterClass.includes("волшебник") || characterClass.includes("wizard") ||
      characterClass.includes("изобретатель") || characterClass.includes("artificer")) {
    return Math.floor((character.abilities.INT || character.intelligence || 10) - 10) / 2;
  }
  
  // Wisdom-based casters
  if (characterClass.includes("жрец") || characterClass.includes("cleric") ||
      characterClass.includes("друид") || characterClass.includes("druid") ||
      characterClass.includes("следопыт") || characterClass.includes("ranger")) {
    return Math.floor((character.abilities.WIS || character.wisdom || 10) - 10) / 2;
  }
  
  // Charisma-based casters
  if (characterClass.includes("бард") || characterClass.includes("bard") ||
      characterClass.includes("чародей") || characterClass.includes("sorcerer") ||
      characterClass.includes("колдун") || characterClass.includes("warlock") ||
      characterClass.includes("паладин") || characterClass.includes("paladin")) {
    return Math.floor((character.abilities.CHA || character.charisma || 10) - 10) / 2;
  }
  
  return 0;
}

/**
 * Calculate spell save DC for a character
 */
export function calculateSpellSaveDC(character: any): number {
  if (!character) return 8;
  
  const abilityMod = getSpellcastingAbilityModifier(character);
  const profBonus = character.proficiencyBonus || 2;
  
  return 8 + abilityMod + profBonus;
}

/**
 * Calculate spell attack bonus for a character
 */
export function calculateSpellAttackBonus(character: any): number {
  if (!character) return 0;
  
  const abilityMod = getSpellcastingAbilityModifier(character);
  const profBonus = character.proficiencyBonus || 2;
  
  return abilityMod + profBonus;
}

/**
 * Get default spellcasting ability for a class
 */
export function getDefaultCastingAbility(characterClass: string): string {
  const classLower = characterClass?.toLowerCase() || '';
  
  // Intelligence-based casters
  if (classLower.includes("волшебник") || classLower.includes("wizard") ||
      classLower.includes("изобретатель") || classLower.includes("artificer")) {
    return "intelligence";
  }
  
  // Wisdom-based casters
  if (classLower.includes("жрец") || classLower.includes("cleric") ||
      classLower.includes("друид") || classLower.includes("druid")) {
    return "wisdom";
  }
  
  // Default to charisma for remaining classes
  return "charisma";
}

/**
 * Calculate available spells by class and level
 */
export function calculateAvailableSpellsByClassAndLevel(
  characterClass: string,
  level: number,
  abilityModifier: number = 0
): { maxSpellLevel: number; cantripsCount: number; knownSpells: number } {
  const classLower = characterClass.toLowerCase();
  
  // Default values
  let maxSpellLevel = 0;
  let cantripsCount = 0;
  let knownSpells = 0;
  
  // Full casters
  const fullCasters = ["маг", "волшебник", "чародей", "колдун", "жрец", "друид", "бард",
                       "wizard", "sorcerer", "warlock", "cleric", "druid", "bard"];
                       
  // Half casters
  const halfCasters = ["паладин", "следопыт", "ranger", "paladin"];
  
  // Calculate max spell level
  if (fullCasters.some(c => classLower.includes(c))) {
    // Full casters: level / 2 rounded up
    maxSpellLevel = Math.ceil(level / 2);
  } else if (halfCasters.some(c => classLower.includes(c))) {
    // Half casters: level / 2 rounded down
    maxSpellLevel = Math.floor(level / 2);
  }
  
  // Cap at 9
  maxSpellLevel = Math.min(maxSpellLevel, 9);
  
  // Calculate cantrips known
  if (fullCasters.some(c => classLower.includes(c))) {
    if (classLower.includes("чародей") || classLower.includes("sorcerer")) {
      // Sorcerers get more cantrips
      cantripsCount = level >= 10 ? 6 : level >= 4 ? 5 : 4;
    } else if (classLower.includes("колдун") || classLower.includes("warlock") ||
               classLower.includes("бард") || classLower.includes("bard")) {
      // Warlock and Bard
      cantripsCount = level >= 10 ? 4 : 2;
    } else {
      // Other full casters
      cantripsCount = level >= 10 ? 5 : level >= 4 ? 4 : 3;
    }
  } else if (halfCasters.some(c => classLower.includes(c))) {
    cantripsCount = 0; // Half casters generally don't get cantrips in 5e
  }
  
  // Calculate spells known
  if (classLower.includes("волшебник") || classLower.includes("wizard")) {
    // Wizards: level + Int mod prepared spells, unlimited in spellbook
    knownSpells = level + abilityModifier;
  } else if (classLower.includes("жрец") || classLower.includes("cleric") ||
             classLower.includes("друид") || classLower.includes("druid")) {
    // Clerics and Druids: level + ability mod
    knownSpells = level + abilityModifier;
  } else if (classLower.includes("бард") || classLower.includes("bard")) {
    // Bards have a specific progression
    knownSpells = Math.max(4, level + 3); // Example
  } else if (classLower.includes("чародей") || classLower.includes("sorcerer")) {
    // Sorcerers have a specific progression
    knownSpells = level + 1;
  } else if (classLower.includes("колдун") || classLower.includes("warlock")) {
    // Warlocks have a specific progression
    knownSpells = Math.max(1, level + 1);
  } else if (classLower.includes("паладин") || classLower.includes("paladin") ||
             classLower.includes("следопыт") || classLower.includes("ranger")) {
    // Paladins and Rangers: half level + ability mod
    knownSpells = Math.floor(level / 2) + abilityModifier;
  }
  
  knownSpells = Math.max(1, knownSpells); // Ensure at least 1 spell
  
  return { maxSpellLevel, cantripsCount, knownSpells };
}

/**
 * Filter spells by class and level
 */
export function filterSpellsByClassAndLevel(
  spells: SpellData[],
  characterClass: string,
  maxLevel: number
): SpellData[] {
  if (!spells || !Array.isArray(spells)) return [];
  if (!characterClass) return spells;
  
  const classLower = characterClass.toLowerCase();
  
  // Map class names
  const classMap: Record<string, string[]> = {
    "жрец": ["cleric", "жрец"],
    "волшебник": ["wizard", "волшебник"],
    "друид": ["druid", "друид"],
    "бард": ["bard", "бард"],
    "чародей": ["sorcerer", "чародей"],
    "колдун": ["warlock", "колдун"],
    "паладин": ["paladin", "паладин"],
    "следопыт": ["ranger", "следопыт"]
  };
  
  const classNames = classMap[classLower] || [classLower];
  
  return spells.filter(spell => {
    // Filter by level
    if (spell.level > maxLevel) return false;
    
    // Filter by class
    if (!spell.classes) return false;
    
    const spellClasses = Array.isArray(spell.classes)
      ? spell.classes.map(c => typeof c === 'string' ? c.toLowerCase() : '')
      : [spell.classes.toLowerCase()];
    
    // Check if any class name matches
    return classNames.some(className => 
      spellClasses.some(spellClass => spellClass.includes(className))
    );
  });
}

/**
 * Converts a SpellData object to CharacterSpell format
 */
export function convertToCharacterSpell(spell: SpellData): CharacterSpell {
  return {
    id: spell.id || `spell-${spell.name.toLowerCase().replace(/\s+/g, '-')}`,
    name: spell.name,
    level: spell.level,
    school: spell.school,
    castingTime: spell.castingTime,
    range: spell.range,
    components: spell.components,
    duration: spell.duration,
    description: spell.description,
    classes: spell.classes,
    verbal: spell.verbal,
    somatic: spell.somatic,
    material: spell.material,
    ritual: spell.ritual,
    concentration: spell.concentration
  };
}

/**
 * Converts SpellData array to CharacterSpell array
 */
export function convertSpellArray(spells: SpellData[]): CharacterSpell[] {
  return spells.map(convertToCharacterSpell);
}

/**
 * Helper function to parse spell components from a string
 */
export function parseComponents(componentString: string): {
  verbal: boolean;
  somatic: boolean;
  material: boolean;
  ritual: boolean;
  concentration: boolean;
} {
  return {
    verbal: componentString.includes('В'),
    somatic: componentString.includes('С'),
    material: componentString.includes('М'),
    ritual: componentString.includes('Р') || componentString.includes('ритуал'),
    concentration: componentString.includes('К') || componentString.includes('концентрация')
  };
}
