
import { CharacterSpell } from '@/types/character';
import { processSpellBatch, importSpellsFromText } from './spellBatchImporter';

// Функция для обновления списка заклинаний на основе текстового ввода
export function updateSpellsFromText(rawText: string, existingSpells: CharacterSpell[]): CharacterSpell[] {
  try {
    const newSpells = processSpellBatch(rawText);
    return [...existingSpells, ...newSpells];
  } catch (error) {
    console.error('Ошибка при обновлении заклинаний:', error);
    return existingSpells; // В случае ошибки возвращаем исходный список
  }
}
