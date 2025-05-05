
import { SpellData } from './types';

/**
 * Фильтрует заклинания по поисковому запросу
 */
export const filterBySearchTerm = (spells: SpellData[], searchTerm: string): SpellData[] => {
  if (!searchTerm) return spells;
  
  const term = searchTerm.toLowerCase();
  return spells.filter(spell => {
    return (
      (spell.name && spell.name.toLowerCase().includes(term)) ||
      (spell.description && spell.description.toLowerCase().includes(term)) ||
      (spell.school && spell.school.toLowerCase().includes(term))
    );
  });
};

/**
 * Фильтрует заклинания по уровню
 */
export const filterByLevel = (spells: SpellData[], levelFilters: number[]): SpellData[] => {
  if (!levelFilters.length) return spells;
  
  return spells.filter(spell => levelFilters.includes(spell.level));
};

/**
 * Фильтрует заклинания по школе магии
 */
export const filterBySchool = (spells: SpellData[], schoolFilters: string[]): SpellData[] => {
  if (!schoolFilters.length) return spells;
  
  return spells.filter(spell => 
    spell.school && schoolFilters.includes(spell.school)
  );
};

/**
 * Фильтрует заклинания по классу
 */
export const filterByClass = (spells: SpellData[], classFilters: string[]): SpellData[] => {
  if (!classFilters.length) return spells;
  
  return spells.filter(spell => {
    if (!spell.classes) return false;
    
    if (Array.isArray(spell.classes)) {
      return spell.classes.some(cls => classFilters.includes(cls));
    }
    
    // Если classes - это строка, разделим её запятыми
    if (typeof spell.classes === 'string') {
      const classList = spell.classes.split(',').map(c => c.trim());
      return classList.some(cls => classFilters.includes(cls));
    }
    
    return false;
  });
};

/**
 * Извлекает все уникальные классы из списка заклинаний
 */
export const extractClasses = (spells: SpellData[]): string[] => {
  const uniqueClasses = new Set<string>();
  
  spells.forEach(spell => {
    if (!spell.classes) return;
    
    if (Array.isArray(spell.classes)) {
      spell.classes.forEach(cls => uniqueClasses.add(cls));
    } else if (typeof spell.classes === 'string') {
      spell.classes.split(',').map(c => c.trim()).forEach(cls => uniqueClasses.add(cls));
    }
  });
  
  return Array.from(uniqueClasses).sort();
};

/**
 * Форматирует классы в строку
 */
export const formatClassList = (classes: string[] | string | undefined): string => {
  if (!classes) return '';
  if (Array.isArray(classes)) {
    return classes.join(', ');
  }
  return classes;
};
