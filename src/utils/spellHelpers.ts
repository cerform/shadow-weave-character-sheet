

import { CharacterSpell } from '@/types/character';
import { SpellData } from '@/types/spells';

/**
 * Generates a spell ID from its name
 */
export function generateSpellId(spell: { name: string }): string {
  return `spell-${spell.name.toLowerCase().replace(/\s+/g, '-')}`;
}

/**
 * Ensures that a spell has an ID
 */
export function ensureSpellId(spell: any): any {
  if (!spell.id) {
    return {
      ...spell,
      id: generateSpellId(spell)
    };
  }
  return spell;
}

/**
 * Ensures that all spells in an array have IDs
 */
export function ensureSpellIds<T extends { name: string, id?: string }>(spells: T[]): T[] {
  return spells.map(spell => {
    if (!spell.id) {
      return {
        ...spell,
        id: generateSpellId(spell)
      };
    }
    return spell;
  });
}

/**
 * Converts a string array to an array of CharacterSpell objects
 */
export function convertStringArrayToSpells(spellNames: string[]): CharacterSpell[] {
  return spellNames.map(name => ({
    id: generateSpellId({ name }),
    name,
    level: 0,
    school: 'Универсальная'
  }));
}

/**
 * Ensures that all spells in a mixed array have the correct format
 */
export function normalizeSpellArray(spells: (CharacterSpell | string)[]): CharacterSpell[] {
  return spells.map(spell => {
    if (typeof spell === 'string') {
      return {
        id: generateSpellId({ name: spell }),
        name: spell,
        level: 0,
        school: 'Универсальная'
      };
    }
    return ensureSpellId(spell);
  });
}

/**
 * Formats the spell level name
 */
export function getSpellLevelName(level: number): string {
  if (level === 0) return 'Заговор';
  return `${level}-й уровень`;
}

/**
 * Convert CharacterSpell array to SpellData array
 */
export function convertCharacterSpellsToSpellData(spells: (CharacterSpell | string)[]): SpellData[] {
  return normalizeSpellArray(spells).map(spell => ({
    id: spell.id || generateSpellId(spell),
    name: spell.name,
    level: spell.level || 0,
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
  }));
}

/**
 * Extracts spell details from a text representation
 */
export function extractSpellDetailsFromText(text: string): Partial<CharacterSpell> {
  // Basic parsing logic for spell text format
  const levelMatch = text.match(/\[(\d+)\]/);
  const level = levelMatch ? parseInt(levelMatch[1]) : 0;
  
  // Remove the level part and clean up the name
  let name = text.replace(/\[\d+\]\s*/, '').trim();
  
  // Check for components
  const verbal = text.includes(' В') || text.includes(' B');
  const somatic = text.includes(' С') || text.includes(' S');
  const material = text.includes(' М') || text.includes(' M');
  
  // Remove component indicators from name if they exist at the end
  name = name.replace(/\s[ВСМ]+$/, '').replace(/\s[BSM]+$/, '').trim();
  
  return {
    name,
    level,
    verbal,
    somatic,
    material
  };
}
