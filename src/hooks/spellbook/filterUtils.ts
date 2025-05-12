
import { SpellData, SpellFilters } from '@/types/spells';

/**
 * Search spells by name
 */
export function searchSpellsByName(spells: SpellData[], searchTerm: string): SpellData[] {
  if (!searchTerm) return spells;
  
  const normalizedSearchTerm = searchTerm.toLowerCase();
  return spells.filter(spell => 
    spell.name.toLowerCase().includes(normalizedSearchTerm) ||
    (typeof spell.description === 'string' && spell.description.toLowerCase().includes(normalizedSearchTerm))
  );
}

/**
 * Filter spells by level
 */
export function filterSpellsByLevel(spells: SpellData[], levels: number[]): SpellData[] {
  if (!levels.length) return spells;
  return spells.filter(spell => levels.includes(spell.level));
}

/**
 * Filter spells by school
 */
export function filterSpellsBySchool(spells: SpellData[], schools: string[]): SpellData[] {
  if (!schools.length) return spells;
  
  return spells.filter(spell => {
    const spellSchool = spell.school?.toLowerCase() || '';
    return schools.some(school => school.toLowerCase() === spellSchool);
  });
}

/**
 * Filter spells by class
 */
export function filterSpellsByClass(spells: SpellData[], classes: string[]): SpellData[] {
  if (!classes.length) return spells;
  
  return spells.filter(spell => {
    // Handle both string and string[] formats for classes
    const spellClasses = Array.isArray(spell.classes) 
      ? spell.classes.map(c => typeof c === 'string' ? c.toLowerCase() : '')
      : typeof spell.classes === 'string' 
        ? [spell.classes.toLowerCase()] 
        : [];
        
    return classes.some(cls => 
      spellClasses.includes(cls.toLowerCase())
    );
  });
}

/**
 * Filter spells by ritual property
 */
export function filterSpellsByRitual(spells: SpellData[], isRitual: boolean | null): SpellData[] {
  if (isRitual === null) return spells;
  return spells.filter(spell => spell.ritual === isRitual);
}

/**
 * Filter spells by concentration property
 */
export function filterSpellsByConcentration(spells: SpellData[], isConcentration: boolean | null): SpellData[] {
  if (isConcentration === null) return spells;
  return spells.filter(spell => spell.concentration === isConcentration);
}

/**
 * Apply all filters to spells
 */
export function applyAllFilters(spells: SpellData[], filters: SpellFilters): SpellData[] {
  let filteredSpells = [...spells];
  
  // Apply name filter
  if (filters.name) {
    filteredSpells = searchSpellsByName(filteredSpells, filters.name);
  }
  
  // Apply level filter
  if (filters.levels.length) {
    filteredSpells = filterSpellsByLevel(filteredSpells, filters.levels);
  }
  
  // Apply school filter
  if (filters.schools.length) {
    filteredSpells = filterSpellsBySchool(filteredSpells, filters.schools);
  }
  
  // Apply class filter
  if (filters.classes.length) {
    filteredSpells = filterSpellsByClass(filteredSpells, filters.classes);
  }
  
  // Apply ritual filter
  if (filters.ritual !== null) {
    filteredSpells = filterSpellsByRitual(filteredSpells, filters.ritual);
  }
  
  // Apply concentration filter
  if (filters.concentration !== null) {
    filteredSpells = filterSpellsByConcentration(filteredSpells, filters.concentration);
  }
  
  return filteredSpells;
}
