
import { SpellData } from '@/types/spells';

/**
 * Фильтрует заклинания по поисковому запросу
 */
export const filterBySearchTerm = (spells: SpellData[], searchTerm: string): SpellData[] => {
  if (!searchTerm) return spells;
  
  const searchLower = searchTerm.toLowerCase();
  return spells.filter(spell => {
    const nameMatch = spell.name.toLowerCase().includes(searchLower);
    
    const schoolMatch = spell.school && spell.school.toLowerCase().includes(searchLower);
    
    let descMatch = false;
    if (spell.description) {
      if (Array.isArray(spell.description)) {
        descMatch = spell.description.join(' ').toLowerCase().includes(searchLower);
      } else {
        descMatch = String(spell.description).toLowerCase().includes(searchLower);
      }
    }
    
    return nameMatch || schoolMatch || descMatch;
  });
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
    
    // Обрабатываем случай, когда classes это строка
    if (typeof spell.classes === 'string') {
      const spellClassLower = spell.classes.toLowerCase();
      return classes.some(c => spellClassLower.includes(c.toLowerCase()));
    }
    
    // Обрабатываем случай, когда classes это массив строк
    if (Array.isArray(spell.classes)) {
      return spell.classes.some(spellClass => {
        if (typeof spellClass === 'string') {
          const spellClassLower = spellClass.toLowerCase();
          return classes.some(c => spellClassLower.includes(c.toLowerCase()));
        }
        return false;
      });
    }
    
    return false;
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
  classes: string[] = [],
  ritual: boolean | null = null,
  concentration: boolean | null = null
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
  
  if (ritual !== null) {
    filtered = filtered.filter(spell => spell.ritual === ritual);
  }
  
  if (concentration !== null) {
    filtered = filtered.filter(spell => spell.concentration === concentration);
  }
  
  return filtered;
};

// Добавляем функцию filterSpells для совместимости с useSpellbook.ts
export const filterSpells = (spells: SpellData[], filter: any): SpellData[] => {
  return applyAllFilters(
    spells, 
    filter.search, 
    filter.level, 
    filter.school,
    filter.className,
    filter.ritual,
    filter.concentration
  );
};
