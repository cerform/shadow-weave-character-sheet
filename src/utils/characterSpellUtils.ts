
import { CharacterSpell } from '@/types/character';

export const characterSpellToString = (spell: CharacterSpell): string => {
  if (!spell) return '';
  
  return `${spell.name} (${spell.level === 0 ? 'Заговор' : `${spell.level} ур.`}, ${spell.school})`;
};

export const addPreparedFieldToSpells = (spells: any[]): CharacterSpell[] => {
  return spells.map(spell => ({
    ...spell,
    prepared: spell.prepared !== undefined ? spell.prepared : false
  }));
};
