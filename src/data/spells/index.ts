import { CharacterSpell } from '@/types/character';
import { level0 } from './level0';
// В полной реализации будут импорты для level1-level9

// Объединяем все заклинания в один массив
const allSpellsWithDuplicates: CharacterSpell[] = [
  ...level0,
  // Здесь будут другие уровни: ...level1, ...level2, и т.д.
];

// Удаляем дубликаты заклинаний
export function removeDuplicateSpells(spells: CharacterSpell[]): CharacterSpell[] {
  const uniqueSpells = new Map<string, CharacterSpell>();
  
  spells.forEach(spell => {
    if (spell && spell.name) {
      const key = spell.name.toLowerCase();
      if (!uniqueSpells.has(key)) {
        uniqueSpells.set(key, spell);
      }
    }
  });
  
  return Array.from(uniqueSpells.values());
}

// Экспортируем массив без дубликатов
export const allSpells: CharacterSpell[] = removeDuplicateSpells(allSpellsWithDuplicates);
