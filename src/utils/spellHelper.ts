
import { CharacterSpell, SpellData } from '@/types/character';

// Helper to add missing prepared field to level2 spells
export const addPreparedFieldToSpells = (spells: any[]): CharacterSpell[] => {
  return spells.map(spell => ({
    ...spell,
    prepared: spell.prepared !== undefined ? spell.prepared : false
  }));
};

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

// Adapter functions that SpellBookViewer might be looking for
export const adaptToSpellData = (spell: CharacterSpell): SpellData => {
  return {
    ...spell
  };
};

export const adaptToCharacterSpell = (spellData: SpellData): CharacterSpell => {
  return {
    ...spellData,
    prepared: spellData.prepared ?? false,
    // Make sure all required CharacterSpell fields are present
    castingTime: spellData.castingTime || '1 действие',
    range: spellData.range || 'На себя',
    components: spellData.components || '',
    duration: spellData.duration || 'Мгновенная',
    description: spellData.description || 'Нет описания'
  };
};
