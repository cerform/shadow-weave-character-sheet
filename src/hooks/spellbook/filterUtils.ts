
import { SpellData } from '@/types/spells';

// Функция для фильтрации заклинаний по поисковому запросу
export const filterSpellsBySearch = (
  spells: SpellData[],
  searchTerm: string
): SpellData[] => {
  if (!searchTerm) return spells;

  const searchLower = searchTerm.toLowerCase();
  return spells.filter(spell => {
    // Поиск по имени
    if (spell.name.toLowerCase().includes(searchLower)) return true;
    
    // Поиск по школе
    if (spell.school.toLowerCase().includes(searchLower)) return true;
    
    // Поиск по описанию
    if (typeof spell.description === 'string' && spell.description.toLowerCase().includes(searchLower)) return true;
    if (Array.isArray(spell.description) && spell.description.some(desc => desc.toLowerCase().includes(searchLower))) return true;
    
    // Поиск по классам
    if (Array.isArray(spell.classes) && spell.classes.some(cls => cls.toLowerCase().includes(searchLower))) return true;
    if (typeof spell.classes === 'string' && spell.classes.toLowerCase().includes(searchLower)) return true;
    
    return false;
  });
};

// Функция для фильтрации заклинаний по уровню
export const filterSpellsByLevel = (
  spells: SpellData[],
  levels: number[]
): SpellData[] => {
  if (!levels.length) return spells;
  return spells.filter(spell => levels.includes(spell.level));
};

// Функция для фильтрации заклинаний по школе
export const filterSpellsBySchool = (
  spells: SpellData[],
  schools: string[]
): SpellData[] => {
  if (!schools.length) return spells;
  return spells.filter(spell => schools.includes(spell.school));
};

// Функция для фильтрации заклинаний по классу
export const filterSpellsByClass = (
  spells: SpellData[],
  classes: string[]
): SpellData[] => {
  if (!classes.length) return spells;
  return spells.filter(spell => {
    if (Array.isArray(spell.classes)) {
      return spell.classes.some(cls => classes.includes(cls));
    } else if (typeof spell.classes === 'string') {
      return classes.includes(spell.classes);
    }
    return false;
  });
};

// Функция для фильтрации заклинаний по ритуальности
export const filterSpellsByRitual = (
  spells: SpellData[],
  isRitual: boolean | null
): SpellData[] => {
  if (isRitual === null) return spells;
  return spells.filter(spell => spell.ritual === isRitual);
};

// Функция для фильтрации заклинаний по концентрации
export const filterSpellsByConcentration = (
  spells: SpellData[],
  isConcentration: boolean | null
): SpellData[] => {
  if (isConcentration === null) return spells;
  return spells.filter(spell => spell.concentration === isConcentration);
};

// Функция для применения всех фильтров
export const applyAllFilters = (
  spells: SpellData[],
  searchTerm: string,
  levels: number[],
  schools: string[],
  classes: string[],
  isRitual: boolean | null,
  isConcentration: boolean | null
): SpellData[] => {
  let filteredSpells = spells;
  
  // Последовательное применение фильтров
  filteredSpells = filterSpellsBySearch(filteredSpells, searchTerm);
  filteredSpells = filterSpellsByLevel(filteredSpells, levels);
  filteredSpells = filterSpellsBySchool(filteredSpells, schools);
  filteredSpells = filterSpellsByClass(filteredSpells, classes);
  filteredSpells = filterSpellsByRitual(filteredSpells, isRitual);
  filteredSpells = filterSpellsByConcentration(filteredSpells, isConcentration);
  
  return filteredSpells;
};
