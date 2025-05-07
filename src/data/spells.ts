import { SpellData, SpellFilter } from '@/types/spells';
import { cantrips } from './cantrips';
import { level0 } from './level0';
import { level1 } from './level1';
import { level2 } from './level2';
import { level3 } from './level3';
import { level4 } from './level4';
import { level5 } from './level5';
import { level6 } from './level6';
import { level7 } from './level7';
import { level8 } from './level8';
import { level9 } from './level9';
import { filterSpells } from '@/utils/spellHelpers';

// Объединяем все списки заклинаний
const allSpells = [
  ...cantrips,
  ...level0,
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
