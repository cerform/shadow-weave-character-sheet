
// Импортируем все массивы заклинаний по уровням
import { cantrips } from './level0';
import { level1 } from './level1';
// Здесь будем добавлять остальные уровни по мере их создания
// import { level2 } from './level2';
// и т.д.

// Собираем все заклинания в единый массив
export const spells = [
  ...cantrips,
  ...level1,
  // Будем добавлять остальные уровни по мере их создания
  // ...level2,
  // и т.д.
];

// Экспортируем заклинания по уровням для удобства доступа
export {
  cantrips as level0,
  level1,
  // Будем экспортировать остальные уровни по мере их создания
  // level2,
  // и т.д.
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
    // Будем добавлять остальные уровни по мере их создания
    // case 2:
    //   return level2;
    // и т.д.
    default:
      return [];
  }
};

// Функция для получения всех заклинаний для определенного класса
export const getSpellsByClass = (className: string) => {
  return spells.filter(spell => {
    if (Array.isArray(spell.classes)) {
      return spell.classes.some(c => c.toLowerCase() === className.toLowerCase());
    } else if (typeof spell.classes === 'string') {
      return spell.classes.toLowerCase() === className.toLowerCase();
    }
    return false;
  });
};

// Функция для получения всех заклинаний
export const getAllSpells = () => {
  return spells;
};
