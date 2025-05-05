
import { CharacterSpell, SpellData } from '@/types/character';

/**
 * Ensures that a spell object has the required 'prepared' field
 */
export const ensurePreparedField = <T extends Partial<CharacterSpell>>(spell: T): T & { prepared: boolean } => {
  return {
    ...spell,
    prepared: spell.prepared ?? false
  };
};

/**
 * Ensures that an array of spell objects all have the required 'prepared' field
 */
export const ensureSpellsHavePreparedField = <T extends Partial<CharacterSpell>>(spells: T[]): Array<T & { prepared: boolean }> => {
  return spells.map(spell => ensurePreparedField(spell));
};

/**
 * Converts a SpellData object to a CharacterSpell
 */
export const spellDataToCharacterSpell = (spellData: SpellData): CharacterSpell => {
  return {
    ...spellData,
    prepared: spellData.prepared ?? false
  };
};
