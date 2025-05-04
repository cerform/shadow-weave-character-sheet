
// Импортируем все заклинания из отдельных файлов
import cantrips from './cantrips';
import level0 from './level0';
import level1 from './level1';
import { level2Spells } from './level2'; // Используем именованный импорт
import { level3Spells } from './level3'; 
import { level4Spells } from './level4';
import { level4Part2 } from './level4_part2';
import { level4Part3 } from './level4_part3'; // Используем именованный импорт
import { level5Spells } from './level5'; // Используем именованный импорт
import { level6Spells } from './level6'; // Используем именованный импорт
import { level7Spells } from './level7'; // Используем именованный импорт
import { level8Spells } from './level8'; // Используем именованный импорт
import { level9Spells } from './level9'; // Используем именованный импорт

import { CharacterSpell } from '@/types/character';

// Объединяем все заклинания в один массив
export const spells: CharacterSpell[] = [
  ...cantrips,
  ...level0,
  ...level1,
  ...(level2Spells || []),
  ...(level3Spells || []),
  ...(level4Spells || []),
  ...(level4Part2 || []),
  ...(level4Part3 || []),
  ...(level5Spells || []),
  ...(level6Spells || []),
  ...(level7Spells || []),
  ...(level8Spells || []),
  ...(level9Spells || [])
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
