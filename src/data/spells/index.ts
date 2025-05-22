
// Импортируем все массивы заклинаний по уровням
import { cantrips } from './level0';
import { level1 } from './level1';
import { level2 } from './level2';
import { level3 } from './level3';
import { level4 } from './level4';
import { level4Part2 } from './level4_part2';
import { level4Part3 } from './level4_part3';
import { level5 } from './level5';
import { level6 } from './level6';
import { level7 } from './level7';
import { level8 } from './level8';
import { level9 } from './level9';

// Объединяем все заклинания 4-го уровня
const combinedLevel4 = [...level4, ...level4Part2, ...level4Part3];

// Собираем все заклинания в единый массив
export const spells = [
  ...cantrips,
  ...level1,
  ...level2,
  ...level3,
  ...combinedLevel4,
  ...level5,
  ...level6,
  ...level7,
  ...level8,
  ...level9,
];

// Экспортируем заклинания по уровням для удобства доступа
export {
  cantrips as level0,
  level1,
  level2,
  level3,
  combinedLevel4 as level4,
  level5,
  level6,
  level7,
  level8,
  level9,
};

// Создаем копию массива для совместимости с существующим кодом
export const allSpells = [...spells];

// Функция для получения заклинаний по уровню
export const getSpellsByLevel = (level: number) => {
  switch (level) {
    case 0:
      return cantrips;
    case 1:
      return level1;
    case 2:
      return level2;
    case 3:
      return level3;
    case 4:
      return combinedLevel4;
    case 5:
      return level5;
    case 6:
      return level6;
    case 7:
      return level7;
    case 8:
      return level8;
    case 9:
      return level9;
    default:
      return [];
  }
};

// Функция для получения всех заклинаний для определенного класса
export const getSpellsByClass = (className: string) => {
  const lowerClassName = className.toLowerCase();
  
  return spells.filter(spell => {
    if (Array.isArray(spell.classes)) {
      return spell.classes.some(c => 
        typeof c === 'string' && c.toLowerCase() === lowerClassName
      );
    } else if (typeof spell.classes === 'string') {
      return spell.classes.toLowerCase() === lowerClassName;
    }
    return false;
  });
};

// Функция для получения всех заклинаний
export const getAllSpells = () => {
  return spells;
};
