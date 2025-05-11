
import { CharacterSpell } from "@/types/character";
import { SpellData } from "@/types/spells";

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
