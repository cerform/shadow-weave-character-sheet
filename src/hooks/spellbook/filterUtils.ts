
import { SpellData } from './types';

// Класс типа guard для проверки строк в массиве
export function isStringArray(value: any): value is string[] {
  return Array.isArray(value) && value.every(item => typeof item === 'string');
}

// Функция для фильтрации заклинаний по поисковому запросу
export const filterSpellsBySearchTerm = (spells: SpellData[], searchTerm: string): SpellData[] => {
  if (searchTerm.trim() === '') {
    return spells;
  }

  const term = searchTerm.toLowerCase();
  return spells.filter(spell => 
    spell.name.toLowerCase().includes(term) || 
    (spell.description && spell.description.toLowerCase().includes(term)) ||
    (spell.classes && (
      (typeof spell.classes === 'string' && spell.classes.toLowerCase().includes(term)) ||
      (isStringArray(spell.classes) && spell.classes.some(cls => 
        typeof cls === 'string' && cls.toLowerCase().includes(term)
      ))
    ))
  );
};

// Функция для фильтрации заклинаний по уровню
export const filterSpellsByLevel = (spells: SpellData[], activeLevels: number[]): SpellData[] => {
  if (activeLevels.length === 0) {
    return spells;
  }
  return spells.filter(spell => activeLevels.includes(spell.level));
};

// Функция для фильтрации заклинаний по школе
export const filterSpellsBySchool = (spells: SpellData[], activeSchools: string[]): SpellData[] => {
  if (activeSchools.length === 0) {
    return spells;
  }
  return spells.filter(spell => activeSchools.includes(spell.school));
};

// Функция для фильтрации заклинаний по классам
export const filterSpellsByClass = (spells: SpellData[], activeClasses: string[]): SpellData[] => {
  if (activeClasses.length === 0) {
    return spells;
  }

  return spells.filter(spell => {
    // Проверка если classes - строка
    if (typeof spell.classes === 'string') {
      const spellClassesStr = spell.classes;
      return activeClasses.some(cls => 
        typeof cls === 'string' && spellClassesStr.toLowerCase().includes(cls.toLowerCase())
      );
    } 
    // Проверка если classes - массив строк
    else if (isStringArray(spell.classes)) {
      return spell.classes.some(spellClass => 
        activeClasses.some(cls => 
          typeof cls === 'string' && typeof spellClass === 'string' && 
          spellClass.toLowerCase().includes(cls.toLowerCase())
        )
      );
    }
    return false;
  });
};

// Извлечение уникальных классов из заклинаний
export const extractClasses = (spells: SpellData[]): string[] => {
  const classesSet = new Set<string>();
  
  spells.forEach(spell => {
    if (typeof spell.classes === 'string') {
      // Если classes - строка, разделяем по запятым
      const classesString = spell.classes;
      classesString.split(',').forEach(cls => 
        classesSet.add(cls.trim())
      );
    } else if (isStringArray(spell.classes)) {
      // Если classes - массив строк, добавляем каждый элемент
      spell.classes.forEach(cls => {
        classesSet.add(cls.trim());
      });
    }
  });
  
  return Array.from(classesSet).sort();
};

// Форматирование классов для отображения
export const formatClasses = (classes: string[] | string | undefined): string => {
  if (!classes) return '';
  
  if (Array.isArray(classes)) {
    return classes.join(', ');
  }
  return classes;
};
