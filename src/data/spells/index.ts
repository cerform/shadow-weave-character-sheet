
// Импортируем все заклинания из отдельных файлов
import cantrips from './cantrips';
import level0 from './level0';
import level1 from './level1';
import level2 from './level2';
import { level3Spells as level3 } from './level3'; // Предположим, что экспорт именован
import { level4Spells as level4 } from './level4';
import { level4Part2 } from './level4_part2';
import level4Part3 from './level4_part3';
import level5 from './level5';
import level6 from './level6';
import level7 from './level7';
import level8 from './level8';
import level9 from './level9';

import { CharacterSpell } from '@/types/character';

// Объединяем все заклинания в один массив
export const spells: CharacterSpell[] = [
  ...cantrips,
  ...level0,
  ...level1,
  ...(level2 || []),
  ...(level3 || []),
  ...(level4 || []),
  ...(level4Part2 || []),
  ...(level4Part3 || []),
  ...(level5 || []),
  ...(level6 || []),
  ...(level7 || []),
  ...(level8 || []),
  ...(level9 || [])
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

// Функция для получения заклинаний по классу
export const getSpellsByClass = (className: string): CharacterSpell[] => {
  return spells.filter(spell => {
    const spellClasses = Array.isArray(spell.classes) ? spell.classes : [spell.classes];
    return spellClasses.includes(className);
  });
};

// Функции для получения заклинаний по уровню
export const getCantrips = () => spells.filter(spell => spell.level === 0);
export const getSpellsByLevel = (level: number) => spells.filter(spell => spell.level === level);
