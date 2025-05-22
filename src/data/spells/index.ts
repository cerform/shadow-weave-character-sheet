
// Импортируем все массивы заклинаний по уровням
import { cantrips } from './level0';
import { level1 } from './level1';
// Импортируем заклинания 4-го уровня
import { level4 } from './level4';

// Собираем все заклинания в единый массив
export const spells = [
  ...cantrips,
  ...level1,
  // Добавляем заклинания 4-го уровня
  ...level4,
];

// Экспортируем заклинания по уровням для удобства доступа
export {
  cantrips as level0,
  level1,
  level4,
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
    case 4:
      return level4;
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
