
import { SpellData } from "@/types/spells";

/**
 * Вычисляет максимальный уровень заклинаний, доступный персонажу
 */
export const getMaxSpellLevel = (className: string, level: number): number => {
  // Полные заклинатели
  if (['Маг', 'Чародей', 'Волшебник', 'Друид', 'Жрец', 'Бард'].includes(className)) {
    if (level >= 17) return 9;
    else if (level >= 15) return 8;
    else if (level >= 13) return 7;
    else if (level >= 11) return 6;
    else if (level >= 9) return 5;
    else if (level >= 7) return 4;
    else if (level >= 5) return 3;
    else if (level >= 3) return 2;
    else if (level >= 1) return 1;
  }
  // Полу-заклинатели
  else if (['Паладин', 'Следопыт', 'Искусственник'].includes(className)) {
    if (level >= 17) return 5;
    else if (level >= 13) return 4;
    else if (level >= 9) return 3;
    else if (level >= 5) return 2;
    else if (level >= 2) return 1;
  }
  // Частичные заклинатели
  else if (['Воин (Мистический рыцарь)', 'Плут (Мистический ловкач)', 'Монах (Путь четырех стихий)'].includes(className)) {
    if (level >= 19) return 4;
    else if (level >= 13) return 3;
    else if (level >= 7) return 2;
    else if (level >= 3) return 1;
  }
  
  return 0;
};

/**
 * Определяет количество известных заклинаний для класса и уровня
 */
export const calculateKnownSpells = (className: string, level: number): { 
  maxLevel: number;
  cantripsCount: number;
  knownSpells: number;
} => {
  const result = {
    maxLevel: getMaxSpellLevel(className, level),
    cantripsCount: 0,
    knownSpells: 0
  };

  // Определение количества заговоров
  if (['Бард', 'Друид', 'Жрец', 'Чародей', 'Маг', 'Волшебник'].includes(className)) {
    if (level >= 10) result.cantripsCount = 5;
    else if (level >= 4) result.cantripsCount = 4;
    else result.cantripsCount = 3;
  } else if (['Следопыт', 'Искусственник'].includes(className)) {
    result.cantripsCount = 0; // Нет заговоров
  } else if (['Воин (Мистический рыцарь)', 'Плут (Мистический ловкач)'].includes(className)) {
    if (level >= 10) result.cantripsCount = 3;
    else result.cantripsCount = 2;
  } else if (className === 'Паладин') {
    result.cantripsCount = 0; // Паладины не имеют заговоров
  }

  // Определение количества известных заклинаний
  if (className === 'Бард') {
    result.knownSpells = Math.min(22, level + 3);
  } else if (className === 'Чародей') {
    result.knownSpells = Math.min(15, level + 1);
  } else if (className === 'Волшебник' || className === 'Жрец' || className === 'Друид') {
    // Для этих классов используется формула: уровень + модификатор способности
    // По умолчанию предположим модификатор +3
    result.knownSpells = level + 3;
  } else if (className === 'Следопыт') {
    if (level >= 2) {
      result.knownSpells = Math.min(11, Math.floor(level / 2) + 1);
    }
  } else if (className === 'Паладин') {
    if (level >= 2) {
      // Для паладинов: уровень / 2 + модификатор харизмы (предположим +2)
      result.knownSpells = Math.floor(level / 2) + 2;
    }
  }

  return result;
};

/**
 * Вычисляет доступные заклинания по классу и уровню
 */
export const calculateAvailableSpellsByClassAndLevel = (
  className: string, 
  level: number
): { 
  maxLevel: number;
  cantripsCount: number;
  knownSpells: number;
} => {
  return calculateKnownSpells(className, level);
};
