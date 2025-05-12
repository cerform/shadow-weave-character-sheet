
import { SpellData, SpellFilters } from '@/types/spells';

// Применение всех фильтров к списку заклинаний
export function applyAllFilters(spells: SpellData[], filters: SpellFilters): SpellData[] {
  let filtered = [...spells];
  
  // Поиск по названию
  filtered = searchSpellsByName(filtered, filters.name);
  
  // Фильтрация по уровню
  if (filters.levels && filters.levels.length > 0) {
    filtered = filterSpellsByLevel(filtered, filters.levels);
  }
  
  // Фильтрация по школе
  if (filters.schools && filters.schools.length > 0) {
    filtered = filterSpellsBySchool(filtered, filters.schools);
  }
  
  // Фильтрация по классу
  if (filters.classes && filters.classes.length > 0) {
    filtered = filterSpellsByClass(filtered, filters.classes);
  }
  
  // Фильтрация по ритуалам
  if (filters.ritual !== null) {
    filtered = filterSpellsByRitual(filtered, filters.ritual);
  }
  
  // Фильтрация по концентрации
  if (filters.concentration !== null) {
    filtered = filterSpellsByConcentration(filtered, filters.concentration);
  }
  
  return filtered;
}

// Поиск заклинаний по названию
export function searchSpellsByName(spells: SpellData[], searchTerm: string): SpellData[] {
  if (!searchTerm || searchTerm.trim() === '') {
    return spells;
  }
  
  const term = searchTerm.toLowerCase().trim();
  return spells.filter(spell => 
    spell.name.toLowerCase().includes(term)
  );
}

// Фильтрация заклинаний по уровню
export function filterSpellsByLevel(spells: SpellData[], levels: number[]): SpellData[] {
  if (!levels || levels.length === 0) {
    return spells;
  }
  
  return spells.filter(spell => levels.includes(spell.level));
}

// Фильтрация заклинаний по школе магии
export function filterSpellsBySchool(spells: SpellData[], schools: string[]): SpellData[] {
  if (!schools || schools.length === 0) {
    return spells;
  }
  
  const lowerCaseSchools = schools.map(school => school.toLowerCase());
  return spells.filter(spell => 
    spell.school && lowerCaseSchools.includes(spell.school.toLowerCase())
  );
}

// Фильтрация заклинаний по классу
export function filterSpellsByClass(spells: SpellData[], classes: string[]): SpellData[] {
  if (!classes || classes.length === 0) {
    return spells;
  }
  
  const lowerCaseClasses = classes.map(cls => cls.toLowerCase());
  
  return spells.filter(spell => {
    if (!spell.classes) return false;
    
    if (Array.isArray(spell.classes)) {
      return spell.classes.some(cls => 
        typeof cls === 'string' && lowerCaseClasses.includes(cls.toLowerCase())
      );
    } else {
      return typeof spell.classes === 'string' && 
        lowerCaseClasses.includes(spell.classes.toLowerCase());
    }
  });
}

// Фильтрация заклинаний по свойству "ритуал"
export function filterSpellsByRitual(spells: SpellData[], isRitual: boolean): SpellData[] {
  return spells.filter(spell => spell.ritual === isRitual);
}

// Фильтрация заклинаний по свойству "концентрация"
export function filterSpellsByConcentration(spells: SpellData[], isConcentration: boolean): SpellData[] {
  return spells.filter(spell => spell.concentration === isConcentration);
}
