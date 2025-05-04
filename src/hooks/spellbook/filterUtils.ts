
import { SpellData } from './types';
import { safeSome, safeFilter } from '@/utils/spellUtils';

/**
 * Фильтрует заклинания по поисковому запросу
 * @param spells Массив заклинаний
 * @param searchTerm Поисковый запрос
 * @returns Отфильтрованный массив заклинаний
 */
export const filterBySearchTerm = (spells: SpellData[], searchTerm: string): SpellData[] => {
  if (!searchTerm) return spells;
  
  const lowerCaseSearchTerm = searchTerm.toLowerCase();
  
  return spells.filter((spell) => {
    return spell.name.toLowerCase().includes(lowerCaseSearchTerm)
      || (spell.description && spell.description.toLowerCase().includes(lowerCaseSearchTerm))
      || (spell.school && spell.school.toLowerCase().includes(lowerCaseSearchTerm));
  });
};

/**
 * Фильтрует заклинания по уровню
 * @param spells Массив заклинаний
 * @param levels Массив уровней для фильтрации
 * @returns Отфильтрованный массив заклинаний
 */
export const filterByLevel = (spells: SpellData[], levels: number[]): SpellData[] => {
  if (!levels.length) return spells;
  
  return spells.filter((spell) => levels.includes(spell.level));
};

/**
 * Фильтрует заклинания по школе магии
 * @param spells Массив заклинаний
 * @param schools Массив школ магии для фильтрации
 * @returns Отфильтрованный массив заклинаний
 */
export const filterBySchool = (spells: SpellData[], schools: string[]): SpellData[] => {
  if (!schools.length) return spells;
  
  return spells.filter((spell) => spell.school && schools.includes(spell.school));
};

/**
 * Фильтрует заклинания по классу персонажа
 * @param spells Массив заклинаний
 * @param classes Массив классов для фильтрации
 * @returns Отфильтрованный массив заклинаний
 */
export const filterByClass = (spells: SpellData[], classes: string[]): SpellData[] => {
  if (!classes.length) return spells;
  
  return spells.filter((spell) => {
    if (!spell.classes) return false;
    
    if (Array.isArray(spell.classes)) {
      return safeSome(spell.classes, (cls) => classes.includes(cls));
    } else {
      return classes.includes(spell.classes);
    }
  });
};

/**
 * Извлекает уникальные классы из массива заклинаний
 * @param spells Массив заклинаний
 * @returns Массив уникальных классов
 */
export const extractClasses = (spells: SpellData[]): string[] => {
  const classSet = new Set<string>();
  
  spells.forEach((spell) => {
    if (!spell.classes) return;
    
    if (Array.isArray(spell.classes)) {
      spell.classes.forEach((cls) => classSet.add(cls));
    } else {
      classSet.add(spell.classes);
    }
  });
  
  return Array.from(classSet);
};
