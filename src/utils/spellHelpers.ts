
import { SpellData, SpellFilter } from '@/types/spells';

/**
 * Получение названия уровня заклинания
 */
export const getSpellLevelName = (level: number): string => {
  if (level === 0) return 'Заговор';
  return `${level} уровень`;
};

/**
 * Фильтрация заклинаний на основе предоставленных фильтров
 */
export const filterSpells = (spells: SpellData[], filters: SpellFilter): SpellData[] => {
  if (!filters || Object.keys(filters).length === 0) return spells;

  return spells.filter(spell => {
    // Фильтрация по названию
    if (filters.name && !spell.name.toLowerCase().includes(filters.name.toLowerCase())) {
      return false;
    }

    // Фильтрация по уровню
    if (filters.level !== undefined) {
      if (Array.isArray(filters.level)) {
        if (filters.level.length > 0 && !filters.level.includes(spell.level)) {
          return false;
        }
      } else if (filters.level !== null && filters.level !== spell.level) {
        return false;
      }
    }

    // Фильтрация по школе
    if (filters.school) {
      if (Array.isArray(filters.school)) {
        if (filters.school.length > 0 && !filters.school.includes(spell.school)) {
          return false;
        }
      } else if (filters.school !== spell.school) {
        return false;
      }
    }

    // Фильтрация по классу
    if (filters.class) {
      const spellClasses = Array.isArray(spell.classes) ? spell.classes : [spell.classes];
      
      if (Array.isArray(filters.class)) {
        if (filters.class.length > 0 && !filters.class.some(c => spellClasses.includes(c))) {
          return false;
        }
      } else if (!spellClasses.includes(filters.class)) {
        return false;
      }
    }

    // Фильтрация по ритуалу
    if (filters.ritual !== undefined && spell.ritual !== filters.ritual) {
      return false;
    }

    // Фильтрация по концентрации
    if (filters.concentration !== undefined && spell.concentration !== filters.concentration) {
      return false;
    }

    return true;
  });
};

/**
 * Получение цвета бейджа для уровня заклинания
 */
export const getSpellLevelColor = (level: number): string => {
  const colors = [
    'bg-stone-800 text-white', // Заговоры
    'bg-blue-900 text-white',  // 1 уровень
    'bg-indigo-900 text-white', // 2 уровень
    'bg-purple-900 text-white', // 3 уровень
    'bg-pink-900 text-white', // 4 уровень
    'bg-red-900 text-white', // 5 уровень
    'bg-orange-900 text-white', // 6 уровень
    'bg-amber-900 text-white', // 7 уровень
    'bg-yellow-900 text-white', // 8 уровень
    'bg-green-900 text-white', // 9 уровень
  ];
  
  return colors[level] || colors[0];
};

/**
 * Форматирование классов для отображения
 */
export const formatSpellClasses = (classes: string[] | string | undefined): string => {
  if (!classes) return '';
  
  if (Array.isArray(classes)) {
    return classes.join(', ');
  }
  
  return classes;
};

/**
 * Проверка соответствия заклинания строке поиска
 */
export const spellMatchesSearchTerm = (spell: SpellData, searchTerm: string): boolean => {
  if (!searchTerm) return true;
  
  const normalizedSearch = searchTerm.toLowerCase();
  
  // Проверяем название
  if (spell.name.toLowerCase().includes(normalizedSearch)) return true;
  
  // Проверяем английское название, если есть
  if (spell.name_en && spell.name_en.toLowerCase().includes(normalizedSearch)) return true;
  
  // Проверяем описание
  if (typeof spell.description === 'string' && 
      spell.description.toLowerCase().includes(normalizedSearch)) return true;
  
  // Проверяем школу
  if (spell.school.toLowerCase().includes(normalizedSearch)) return true;
  
  return false;
};
