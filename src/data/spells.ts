
import { SpellData, SpellFilter } from '@/types/spells';
import { cantrips } from './spells/cantrips';
import { level3 } from './spells/level3';
import { level5 } from './spells/level5';
import { level6 } from './spells/level6';
import { level7 } from './spells/level7';
import { level8 } from './spells/level8';
import { level9 } from './spells/level9';
import { filterSpells } from '@/utils/spellHelpers';

// Объединяем все списки заклинаний
const allSpells = [
  ...cantrips,
  ...level3,
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
