
import { CharacterSpell } from '@/types/character';
import { componentsToString } from './spellProcessors';

/**
 * Преобразует объект заклинания в строковое представление
 */
export function characterSpellToString(spell: CharacterSpell): string {
  let result = `[${spell.level}] ${spell.name}`;
  
  // Добавляем компоненты, если они определены
  const components = componentsToString({
    verbal: spell.verbal,
    somatic: spell.somatic,
    material: spell.material,
    ritual: spell.ritual,
    concentration: spell.concentration
  });
  
  if (components) {
    result += ` ${components}`;
  }
  
  return result;
}

/**
 * Группирует заклинания по уровням
 */
export function groupSpellsByLevel(spells: CharacterSpell[]): Record<number, CharacterSpell[]> {
  const result: Record<number, CharacterSpell[]> = {};
  
  for (const spell of spells) {
    const level = spell.level;
    if (!result[level]) {
      result[level] = [];
    }
    result[level].push(spell);
  }
  
  return result;
}

/**
 * Сортирует заклинания по уровню и затем по имени
 */
export function sortSpells(spells: CharacterSpell[]): CharacterSpell[] {
  return [...spells].sort((a, b) => {
    if (a.level !== b.level) {
      return a.level - b.level;
    }
    return a.name.localeCompare(b.name);
  });
}

/**
 * Фильтрует заклинания по заданным параметрам
 */
export function filterSpells(spells: CharacterSpell[], {
  searchTerm = '',
  level,
  prepared,
  school,
}: {
  searchTerm?: string;
  level?: number | number[];
  prepared?: boolean;
  school?: string | string[];
} = {}): CharacterSpell[] {
  return spells.filter(spell => {
    // Фильтр по поисковому запросу
    const matchesSearch = !searchTerm || spell.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Фильтр по уровню
    const matchesLevel = level === undefined || 
      (Array.isArray(level) ? level.includes(spell.level) : spell.level === level);
    
    // Фильтр по статусу подготовки
    const matchesPrepared = prepared === undefined || spell.prepared === prepared;
    
    // Фильтр по школе
    const matchesSchool = school === undefined || 
      (Array.isArray(school) 
        ? school.includes(spell.school || '')
        : spell.school === school);
    
    return matchesSearch && matchesLevel && matchesPrepared && matchesSchool;
  });
}
