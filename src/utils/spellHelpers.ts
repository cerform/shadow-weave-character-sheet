
import { SpellData, SpellFilter } from '@/types/spells';

export function filterSpells(spells: SpellData[], filters: SpellFilter): SpellData[] {
  return spells.filter(spell => {
    // Filter by level
    if (filters.level !== undefined) {
      if (Array.isArray(filters.level)) {
        if (!filters.level.includes(spell.level)) return false;
      } else if (spell.level !== filters.level) {
        return false;
      }
    }

    // Filter by school
    if (filters.school !== undefined) {
      if (Array.isArray(filters.school)) {
        if (!filters.school.includes(spell.school)) return false;
      } else if (spell.school !== filters.school) {
        return false;
      }
    }

    // Filter by class
    if (filters.class !== undefined) {
      const spellClasses = Array.isArray(spell.classes) ? spell.classes : [spell.classes];
      if (Array.isArray(filters.class)) {
        if (!filters.class.some(c => spellClasses.includes(c))) return false;
      } else if (!spellClasses.includes(filters.class)) {
        return false;
      }
    }

    // Filter by name
    if (filters.name !== undefined) {
      const nameMatch = spell.name.toLowerCase().includes(filters.name.toLowerCase());
      if (!nameMatch) return false;
    }

    // Filter by ritual
    if (filters.ritual !== undefined && spell.ritual !== filters.ritual) {
      return false;
    }

    // Filter by concentration
    if (filters.concentration !== undefined && spell.concentration !== filters.concentration) {
      return false;
    }

    return true;
  });
}
