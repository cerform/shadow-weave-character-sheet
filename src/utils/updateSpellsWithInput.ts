
import { CharacterSpell } from '@/types/character';
import { importSpellsFromText } from './spellBatchImporter';

export const updateSpellsWithInput = (
  input: string,
  existingSpells: CharacterSpell[]
): CharacterSpell[] => {
  return importSpellsFromText(input, existingSpells);
};
