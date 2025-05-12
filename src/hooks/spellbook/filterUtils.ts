
import { SpellData, SpellFilters } from "@/types/spells";

/**
 * Filter spells by name
 */
export const searchSpellsByName = (
  spells: SpellData[], 
  searchTerm: string
): SpellData[] => {
  if (!searchTerm.trim()) return spells;
  
  const normalizedSearch = searchTerm.toLowerCase().trim();
  return spells.filter(spell => 
    spell.name.toLowerCase().includes(normalizedSearch)
  );
};

/**
 * Filter spells by level
 */
export const filterSpellsByLevel = (
  spells: SpellData[], 
  levels: number[]
): SpellData[] => {
  if (!levels.length) return spells;
  return spells.filter(spell => levels.includes(spell.level));
};

/**
 * Filter spells by school
 */
export const filterSpellsBySchool = (
  spells: SpellData[], 
  schools: string[]
): SpellData[] => {
  if (!schools.length) return spells;
  return spells.filter(spell => {
    const spellSchool = typeof spell.school === 'string' ? spell.school.toLowerCase() : '';
    return schools.some(school => school.toLowerCase() === spellSchool);
  });
};

/**
 * Filter spells by class
 */
export const filterSpellsByClass = (
  spells: SpellData[], 
  classes: string[]
): SpellData[] => {
  if (!classes.length) return spells;
  
  return spells.filter(spell => {
    // Handle array of classes
    if (Array.isArray(spell.classes)) {
      return spell.classes.some(spellClass => {
        const normalizedSpellClass = typeof spellClass === 'string' ? spellClass.toLowerCase() : '';
        return classes.some(cls => cls.toLowerCase() === normalizedSpellClass);
      });
    }
    // Handle string of classes
    else if (typeof spell.classes === 'string') {
      const spellClassLower = spell.classes.toLowerCase();
      return classes.some(cls => spellClassLower.includes(cls.toLowerCase()));
    }
    return false;
  });
};

/**
 * Filter spells by ritual property
 */
export const filterSpellsByRitual = (
  spells: SpellData[], 
  ritual: boolean | null
): SpellData[] => {
  if (ritual === null) return spells;
  return spells.filter(spell => spell.ritual === ritual);
};

/**
 * Filter spells by concentration property
 */
export const filterSpellsByConcentration = (
  spells: SpellData[], 
  concentration: boolean | null
): SpellData[] => {
  if (concentration === null) return spells;
  return spells.filter(spell => spell.concentration === concentration);
};

/**
 * Apply all filters to spells
 */
export const applyAllFilters = (
  spells: SpellData[], 
  filters: SpellFilters
): SpellData[] => {
  let filteredSpells = [...spells];
  
  // Apply name search
  filteredSpells = searchSpellsByName(filteredSpells, filters.name);
  
  // Apply level filter
  filteredSpells = filterSpellsByLevel(filteredSpells, filters.levels);
  
  // Apply school filter
  filteredSpells = filterSpellsBySchool(filteredSpells, filters.schools);
  
  // Apply class filter
  filteredSpells = filterSpellsByClass(filteredSpells, filters.classes);
  
  // Apply ritual filter
  filteredSpells = filterSpellsByRitual(filteredSpells, filters.ritual);
  
  // Apply concentration filter
  filteredSpells = filterSpellsByConcentration(filteredSpells, filters.concentration);
  
  return filteredSpells;
};
