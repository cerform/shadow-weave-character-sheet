
import { SpellData } from './types';

/**
 * Фильтрация заклинаний по поисковому запросу
 */
export function filterBySearchTerm(spells: SpellData[], searchTerm: string): SpellData[] {
  if (!searchTerm || searchTerm.trim() === '') {
    return spells;
  }

  const normalizedSearchTerm = searchTerm.toLowerCase().trim();
  
  return spells.filter(spell => {
    // Проверяем имя заклинания
    if (spell.name && spell.name.toLowerCase().includes(normalizedSearchTerm)) {
      return true;
    }
    
    // Проверяем описание заклинания
    if (spell.description && spell.description.toLowerCase().includes(normalizedSearchTerm)) {
      return true;
    }
    
    // Проверяем школу магии
    if (spell.school && spell.school.toLowerCase().includes(normalizedSearchTerm)) {
      return true;
    }

    // Проверяем компоненты
    if (spell.components && spell.components.toLowerCase().includes(normalizedSearchTerm)) {
      return true;
    }

    // Проверяем классы
    const classes = Array.isArray(spell.classes) 
      ? spell.classes 
      : typeof spell.classes === 'string'
        ? spell.classes.split(',').map(c => c.trim())
        : [];

    return classes.some(cls => 
      cls.toLowerCase().includes(normalizedSearchTerm)
    );
  });
}

/**
 * Фильтрация заклинаний по уровню
 */
export function filterByLevel(spells: SpellData[], levels: number[]): SpellData[] {
  if (!levels || levels.length === 0) {
    return spells;
  }
  
  return spells.filter(spell => levels.includes(spell.level));
}

/**
 * Фильтрация заклинаний по школе
 */
export function filterBySchool(spells: SpellData[], schools: string[]): SpellData[] {
  if (!schools || schools.length === 0) {
    return spells;
  }
  
  return spells.filter(spell => {
    if (!spell.school) return false;
    return schools.some(school => 
      spell.school && spell.school.toLowerCase() === school.toLowerCase()
    );
  });
}

/**
 * Фильтрация заклинаний по классу
 */
export function filterByClass(spells: SpellData[], classes: string[]): SpellData[] {
  if (!classes || classes.length === 0) {
    return spells;
  }
  
  return spells.filter(spell => {
    if (!spell.classes) return false;
    
    const spellClasses = Array.isArray(spell.classes)
      ? spell.classes
      : spell.classes.split(',').map(c => c.trim());
      
    return classes.some(cls => 
      spellClasses.some(spellClass => 
        spellClass.toLowerCase() === cls.toLowerCase()
      )
    );
  });
}

/**
 * Извлечение всех доступных классов из списка заклинаний
 */
export function extractClasses(spells: SpellData[]): string[] {
  const classesSet = new Set<string>();
  
  spells.forEach(spell => {
    if (spell.classes) {
      const spellClasses = Array.isArray(spell.classes)
        ? spell.classes
        : spell.classes.split(',').map(c => c.trim());
        
      spellClasses.forEach(cls => classesSet.add(cls));
    }
  });
  
  return Array.from(classesSet).sort();
}

/**
 * Проверяет, содержится ли паттерн в строке (с поддержкой кириллицы)
 */
function findPattern(source: string, pattern: string): boolean {
  return source.toLowerCase().includes(pattern.toLowerCase());
}

/**
 * Функция для фильтрации заклинаний по нескольким критериям
 */
export function filterSpells(
  spells: SpellData[], 
  {
    search,
    levels,
    schools,
    classes
  }: {
    search?: string;
    levels?: number[];
    schools?: string[];
    classes?: string[];
  }
): SpellData[] {
  let filteredSpells = [...spells];
  
  if (search && search.trim() !== '') {
    filteredSpells = filterBySearchTerm(filteredSpells, search);
  }
  
  if (levels && levels.length > 0) {
    filteredSpells = filterByLevel(filteredSpells, levels);
  }
  
  if (schools && schools.length > 0) {
    filteredSpells = filterBySchool(filteredSpells, schools);
  }
  
  if (classes && classes.length > 0) {
    filteredSpells = filterByClass(filteredSpells, classes);
  }
  
  return filteredSpells;
}
