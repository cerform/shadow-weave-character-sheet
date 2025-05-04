
// Импортируем все заклинания из отдельных файлов
import { spells as cantrips } from './cantrips';
import { spells as level0 } from './level0';
import { spells as level1 } from './level1';
import { spells as level2 } from './level2';
import { spells as level3 } from './level3';
import { spells as level4 } from './level4';
import { spells as level4_part2 } from './level4_part2';
import { spells as level4_part3 } from './level4_part3';
import { spells as level5 } from './level5';
import { spells as level6 } from './level6';
import { spells as level7 } from './level7';
import { spells as level8 } from './level8';
import { spells as level9 } from './level9';

import { CharacterSpell } from '@/types/character';

// Объединяем все заклинания в один массив
export const spells: CharacterSpell[] = [
  ...cantrips,
  ...level0,
  ...level1,
  ...level2,
  ...level3,
  ...level4,
  ...level4_part2,
  ...level4_part3,
  ...level5,
  ...level6,
  ...level7,
  ...level8,
  ...level9
];

// Функция для фильтрации заклинаний по различным критериям
export const filterSpells = (
  spellList: CharacterSpell[], 
  filters: {
    level?: number | number[];
    school?: string | string[];
    class?: string | string[];
    name?: string;
  }
): CharacterSpell[] => {
  return spellList.filter(spell => {
    // Фильтрация по уровню
    if (filters.level !== undefined) {
      const levels = Array.isArray(filters.level) ? filters.level : [filters.level];
      if (!levels.includes(spell.level)) return false;
    }
    
    // Фильтрация по школе
    if (filters.school !== undefined) {
      const schools = Array.isArray(filters.school) ? filters.school : [filters.school];
      if (!schools.includes(spell.school)) return false;
    }
    
    // Фильтрация по классу
    if (filters.class !== undefined) {
      const classes = Array.isArray(filters.class) ? filters.class : [filters.class];
      const spellClasses = Array.isArray(spell.classes) ? spell.classes : [spell.classes];
      
      // Проверяем, есть ли хотя бы один класс из фильтра в списке классов заклинания
      if (!classes.some(cls => spellClasses.includes(cls))) return false;
    }
    
    // Фильтрация по имени
    if (filters.name !== undefined && !spell.name.toLowerCase().includes(filters.name.toLowerCase())) {
      return false;
    }
    
    return true;
  });
};

// Функции для получения заклинаний по уровню
export const getCantrips = () => spells.filter(spell => spell.level === 0);
export const getSpellsByLevel = (level: number) => spells.filter(spell => spell.level === level);

// Экспортируем также отдельные наборы заклинаний
export { cantrips, level0, level1, level2, level3, level4, level5, level6, level7, level8, level9 };
