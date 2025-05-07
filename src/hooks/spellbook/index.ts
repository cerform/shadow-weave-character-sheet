
import { SpellData, SpellFilter } from '@/types/spells';
import { CharacterSpell } from '@/types/character';
import { getAllSpells, filterSpells } from '@/data/spells';

export function useSpellbook() {
  // Здесь будем использовать импорт из data/spells
  const allSpells = getAllSpells();

  const loadSpellsForClass = (className: string) => {
    // Логика для загрузки заклинаний для конкретного класса
    console.log(`Loading spells for class: ${className}`);
    return allSpells.filter(spell => {
      const classes = Array.isArray(spell.classes) ? spell.classes : [spell.classes];
      return classes.some(c => c?.toLowerCase() === className?.toLowerCase());
    });
  };

  return {
    spells: allSpells,
    loadSpellsForClass,
    filterSpells: (filters: SpellFilter) => filterSpells(allSpells, filters)
  };
}
