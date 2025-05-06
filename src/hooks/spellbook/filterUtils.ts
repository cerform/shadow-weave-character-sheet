
import { SpellData } from '@/types/spells';

/**
 * Фильтрует заклинания по поисковому запросу
 */
export const filterBySearchTerm = (spells: SpellData[], searchTerm: string): SpellData[] => {
  if (!searchTerm) return spells;
  
  const searchLower = searchTerm.toLowerCase();
  return spells.filter(spell => 
    spell.name.toLowerCase().includes(searchLower) ||
    (spell.school && spell.school.toLowerCase().includes(searchLower)) ||
    (Array.isArray(spell.description) ? 
      spell.description.join(' ').toLowerCase().includes(searchLower) : 
      String(spell.description).toLowerCase().includes(searchLower))
  );
};

/**
 * Фильтрует заклинания по уровню
 */
export const filterByLevel = (spells: SpellData[], levels: number[]): SpellData[] => {
  if (!levels || levels.length === 0) return spells;
  return spells.filter(spell => levels.includes(spell.level));
};

/**
 * Фильтрует заклинания по школе магии
 */
export const filterBySchool = (spells: SpellData[], schools: string[]): SpellData[] => {
  if (!schools || schools.length === 0) return spells;
  return spells.filter(spell => spell.school && schools.includes(spell.school));
};

/**
 * Фильтрует заклинания по классу
 */
export const filterByClass = (spells: SpellData[], classes: string[]): SpellData[] => {
  if (!classes || classes.length === 0) return spells;
  
  return spells.filter(spell => {
    if (!spell.classes) return false;
    
    if (typeof spell.classes === 'string') {
      return classes.some(c => spell.classes.toLowerCase().includes(c.toLowerCase()));
    }
    
    return spell.classes.some(spellClass => 
      classes.some(c => {
        if (typeof spellClass === 'string') {
          return spellClass.toLowerCase().includes(c.toLowerCase());
        }
        return false;
      })
    );
  });
};

/**
 * Применяет все фильтры к списку заклинаний
 */
export const applyAllFilters = (
  spells: SpellData[], 
  searchTerm: string = '', 
  levels: number[] = [], 
  schools: string[] = [],
  classes: string[] = []
): SpellData[] => {
  let filtered = spells;
  
  if (searchTerm) {
    filtered = filterBySearchTerm(filtered, searchTerm);
  }
  
  if (levels && levels.length > 0) {
    filtered = filterByLevel(filtered, levels);
  }
  
  if (schools && schools.length > 0) {
    filtered = filterBySchool(filtered, schools);
  }
  
  if (classes && classes.length > 0) {
    filtered = filterByClass(filtered, classes);
  }
  
  return filtered;
};
