
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

// Получение названия уровня заклинания
export function getSpellLevelName(level: number): string {
  switch (level) {
    case 0:
      return 'Заговор';
    case 1:
      return '1-й уровень';
    case 2:
      return '2-й уровень';
    case 3:
      return '3-й уровень';
    case 4:
      return '4-й уровень';
    case 5:
      return '5-й уровень';
    case 6:
      return '6-й уровень';
    case 7:
      return '7-й уровень';
    case 8:
      return '8-й уровень';
    case 9:
      return '9-й уровень';
    default:
      return `Уровень ${level}`;
  }
}
