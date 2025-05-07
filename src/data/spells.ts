
import { SpellData, SpellFilter } from '@/types/spells';
import { filterSpells } from '@/utils/spellHelpers';

// Create empty arrays for spell levels until we have actual data
const cantrips: SpellData[] = [];
const level1: SpellData[] = [];
const level2: SpellData[] = [];
const level3: SpellData[] = [];
const level4: SpellData[] = [];
const level5: SpellData[] = [];
const level6: SpellData[] = [];
const level7: SpellData[] = [];
const level8: SpellData[] = [];
const level9: SpellData[] = [];

// Объединяем все списки заклинаний
const allSpells: SpellData[] = [
  ...cantrips,
  ...level1,
  ...level2,
  ...level3,
  ...level4,
  ...level5,
  ...level6,
  ...level7,
  ...level8,
  ...level9
];

// Экспортируем функцию для получения всех заклинаний
export function getAllSpells(): SpellData[] {
  return allSpells;
}

// Функция получения заклинаний для определенного класса
export function getSpellsByClass(className: string): SpellData[] {
  return allSpells.filter(spell => {
    const classes = Array.isArray(spell.classes)
      ? spell.classes
      : [spell.classes];
    return classes.includes(className);
  });
}

// Экспортируем функцию фильтрации заклинаний
export { filterSpells };
