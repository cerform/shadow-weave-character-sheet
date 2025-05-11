
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
