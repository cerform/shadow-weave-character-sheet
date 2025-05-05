
import { SpellData } from "./types";
import { CharacterSpell } from "@/types/character.d";

// Get all unique levels from spells array
export const getAllLevels = (spells: SpellData[] | CharacterSpell[]): number[] => {
  const levels = new Set<number>();
  spells.forEach(spell => {
    if (typeof spell.level === 'number') {
      levels.add(spell.level);
    }
  });
  return Array.from(levels).sort((a, b) => a - b);
};

// Get all unique schools from spells array
export const getAllSchools = (spells: SpellData[] | CharacterSpell[]): string[] => {
  const schools = new Set<string>();
  spells.forEach(spell => {
    if (spell.school) {
      schools.add(spell.school);
    }
  });
  return Array.from(schools).sort();
};

// Get all unique classes from spells array
export const getAllClasses = (spells: SpellData[] | CharacterSpell[]): string[] => {
  const classes = new Set<string>();
  spells.forEach(spell => {
    if (spell.classes) {
      if (Array.isArray(spell.classes)) {
        spell.classes.forEach(cls => classes.add(cls));
      } else {
        classes.add(spell.classes);
      }
    }
  });
  return Array.from(classes).sort();
};

// Get badge color by spell level
export const getBadgeColorByLevel = (level: number): string => {
  switch (level) {
    case 0: return "bg-gray-500";
    case 1: return "bg-blue-500";
    case 2: return "bg-green-500";
    case 3: return "bg-yellow-500";
    case 4: return "bg-orange-500";
    case 5: return "bg-red-500";
    case 6: return "bg-purple-500";
    case 7: return "bg-pink-500";
    case 8: return "bg-indigo-500";
    case 9: return "bg-black";
    default: return "bg-gray-500";
  }
};

// Get badge color by school
export const getSchoolBadgeColor = (school: string): string => {
  switch (school.toLowerCase()) {
    case "abjuration": return "bg-blue-500";
    case "conjuration": return "bg-indigo-500";
    case "divination": return "bg-purple-500";
    case "enchantment": return "bg-pink-500";
    case "evocation": return "bg-red-500";
    case "illusion": return "bg-orange-500";
    case "necromancy": return "bg-gray-700";
    case "transmutation": return "bg-green-500";
    default: return "bg-gray-500";
  }
};

// Format classes array/string for display
export const formatClassesString = (classes: string[] | string | undefined): string => {
  if (!classes) return "";
  if (Array.isArray(classes)) {
    return classes.join(", ");
  }
  return classes;
};

// Filter spells by search term
export const filterSpellsBySearchTerm = (spells: SpellData[] | CharacterSpell[], searchTerm: string): (SpellData | CharacterSpell)[] => {
  if (!searchTerm) return spells;
  
  const lowerSearchTerm = searchTerm.toLowerCase();
  return spells.filter(spell => {
    // Search in name
    if (spell.name.toLowerCase().includes(lowerSearchTerm)) return true;
    
    // Search in description
    if (spell.description?.toLowerCase().includes(lowerSearchTerm)) return true;
    
    // Search in classes
    if (spell.classes) {
      if (Array.isArray(spell.classes)) {
        if (spell.classes.some(cls => cls.toLowerCase().includes(lowerSearchTerm))) return true;
      } else {
        if (spell.classes.toLowerCase().includes(lowerSearchTerm)) return true;
      }
    }
    
    // Search in other fields
    if (spell.school?.toLowerCase().includes(lowerSearchTerm)) return true;
    if (spell.castingTime?.toLowerCase().includes(lowerSearchTerm)) return true;
    
    return false;
  });
};

// Filter spells by level
export const filterSpellsByLevel = (spells: SpellData[] | CharacterSpell[], level: number | null): (SpellData | CharacterSpell)[] => {
  if (level === null) return spells;
  return spells.filter(spell => spell.level === level);
};

// Filter spells by school
export const filterSpellsBySchool = (spells: SpellData[] | CharacterSpell[], school: string | null): (SpellData | CharacterSpell)[] => {
  if (!school) return spells;
  return spells.filter(spell => spell.school?.toLowerCase() === school.toLowerCase());
};

// Filter spells by class
export const filterSpellsByClass = (spells: SpellData[] | CharacterSpell[], spellClass: string | null): (SpellData | CharacterSpell)[] => {
  if (!spellClass) return spells;
  
  return spells.filter(spell => {
    if (!spell.classes) return false;
    
    if (Array.isArray(spell.classes)) {
      return spell.classes.some(cls => cls.toLowerCase() === spellClass.toLowerCase());
    } else {
      return spell.classes.toLowerCase() === spellClass.toLowerCase();
    }
  });
};
