
import { SpellData, SpellFilters } from '@/types/spells';

// Функция для поиска заклинаний по имени
export function searchSpellsByName(spells: SpellData[], searchTerm: string): SpellData[] {
  if (!searchTerm) return spells;
  
  const term = searchTerm.toLowerCase();
  return spells.filter(spell => 
    spell.name.toLowerCase().includes(term) || 
    (typeof spell.description === 'string' && spell.description.toLowerCase().includes(term))
  );
}

// Функция для фильтрации заклинаний по уровню
export function filterSpellsByLevel(spells: SpellData[], levels: number[]): SpellData[] {
  if (!levels.length) return spells;
  
  return spells.filter(spell => levels.includes(spell.level));
}

// Функция для фильтрации заклинаний по школе магии
export function filterSpellsBySchool(spells: SpellData[], schools: string[]): SpellData[] {
  if (!schools.length) return spells;
  
  return spells.filter(spell => schools.includes(spell.school));
}

// Функция для фильтрации заклинаний по классу
export function filterSpellsByClass(spells: SpellData[], classes: string[]): SpellData[] {
  if (!classes.length) return spells;
  
  return spells.filter(spell => {
    // Проверяем, является ли classes массивом или строкой
    if (Array.isArray(spell.classes)) {
      return spell.classes.some(spellClass => classes.includes(spellClass));
    }
    
    return typeof spell.classes === 'string' && classes.includes(spell.classes);
  });
}

// Функция для фильтрации заклинаний по признаку "ритуал"
export function filterSpellsByRitual(spells: SpellData[], isRitual: boolean | null): SpellData[] {
  if (isRitual === null) return spells;
  
  return spells.filter(spell => spell.ritual === isRitual);
}

// Функция для фильтрации заклинаний по признаку "концентрация"
export function filterSpellsByConcentration(spells: SpellData[], isConcentration: boolean | null): SpellData[] {
  if (isConcentration === null) return spells;
  
  return spells.filter(spell => spell.concentration === isConcentration);
}

// Функция для применения всех фильтров одновременно
export function applyAllFilters(spells: SpellData[], filters: SpellFilters): SpellData[] {
  let filteredSpells = spells;
  
  // Применяем фильтр по имени
  if (filters.name) {
    filteredSpells = searchSpellsByName(filteredSpells, filters.name);
  }
  
  // Применяем фильтр по уровню
  if (filters.levels.length > 0) {
    filteredSpells = filterSpellsByLevel(filteredSpells, filters.levels);
  }
  
  // Применяем фильтр по школе
  if (filters.schools.length > 0) {
    filteredSpells = filterSpellsBySchool(filteredSpells, filters.schools);
  }
  
  // Применяем фильтр по классу
  if (filters.classes.length > 0) {
    filteredSpells = filterSpellsByClass(filteredSpells, filters.classes);
  }
  
  // Применяем фильтр по ритуалу
  if (filters.ritual !== null) {
    filteredSpells = filterSpellsByRitual(filteredSpells, filters.ritual);
  }
  
  // Применяем фильтр по концентрации
  if (filters.concentration !== null) {
    filteredSpells = filterSpellsByConcentration(filteredSpells, filters.concentration);
  }
  
  return filteredSpells;
}
