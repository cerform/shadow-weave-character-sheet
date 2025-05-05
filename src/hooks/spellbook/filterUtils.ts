
import { SpellData } from "@/types/spells";

/**
 * Фильтрует заклинания по поисковому запросу в имени и описании
 */
export const filterSpellsBySearchTerm = (spells: SpellData[], searchTerm: string): SpellData[] => {
  if (!searchTerm.trim()) return spells;
  
  const term = searchTerm.toLowerCase().trim();
  
  return spells.filter(spell => {
    // Проверяем имя
    if (spell.name.toLowerCase().includes(term)) return true;
    
    // Проверяем описание
    if (typeof spell.description === 'string') {
      if (spell.description.toLowerCase().includes(term)) return true;
    } else if (Array.isArray(spell.description)) {
      if (spell.description.some(d => d.toLowerCase().includes(term))) return true;
    }
    
    // Проверяем школу
    if (spell.school.toLowerCase().includes(term)) return true;
    
    // Проверяем классы
    if (typeof spell.classes === 'string') {
      if (spell.classes.toLowerCase().includes(term)) return true;
    } else if (Array.isArray(spell.classes)) {
      if (spell.classes.some(c => c.toLowerCase().includes(term))) return true;
    }
    
    return false;
  });
};

/**
 * Фильтрует заклинания по школе магии
 */
export const filterSpellsBySchool = (spells: SpellData[], school: string | null): SpellData[] => {
  if (!school) return spells;
  return spells.filter(spell => spell.school.toLowerCase() === school.toLowerCase());
};

/**
 * Фильтрует заклинания по уровню
 */
export const filterSpellsByLevel = (spells: SpellData[], level: number | null): SpellData[] => {
  if (level === null) return spells;
  return spells.filter(spell => spell.level === level);
};

/**
 * Фильтрует заклинания по типу (ритуальные, требующие концентрации или подготовленные)
 */
export const filterSpellsByType = (
  spells: SpellData[], 
  options: { ritual?: boolean; concentration?: boolean; prepared?: boolean }
): SpellData[] => {
  return spells.filter(spell => {
    if (options.ritual && !(spell.ritual || spell.isRitual)) return false;
    if (options.concentration && !(spell.concentration || spell.isConcentration)) return false;
    if (options.prepared && !spell.prepared) return false;
    return true;
  });
};

/**
 * Фильтрует заклинания по классу
 */
export const filterSpellsByClass = (spells: SpellData[], className: string | null): SpellData[] => {
  if (!className) return spells;
  
  return spells.filter(spell => {
    if (typeof spell.classes === 'string') {
      return spell.classes.toLowerCase() === className.toLowerCase();
    } else if (Array.isArray(spell.classes)) {
      return spell.classes.some(c => c.toLowerCase() === className.toLowerCase());
    }
    return false;
  });
};

/**
 * Сортирует заклинания по различным критериям
 */
export const sortSpells = (
  spells: SpellData[], 
  sortBy: 'name' | 'level' | 'school' = 'level'
): SpellData[] => {
  return [...spells].sort((a, b) => {
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    } else if (sortBy === 'level') {
      return a.level === b.level ? a.name.localeCompare(b.name) : a.level - b.level;
    } else if (sortBy === 'school') {
      return a.school === b.school 
        ? (a.level === b.level ? a.name.localeCompare(b.name) : a.level - b.level)
        : a.school.localeCompare(b.school);
    }
    return 0;
  });
};
