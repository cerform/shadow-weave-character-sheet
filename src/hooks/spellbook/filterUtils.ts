
import { SpellData } from "./types";

export const filterBySearchTerm = (spells: SpellData[], searchTerm: string): SpellData[] => {
  if (!searchTerm) return spells;
  
  const term = searchTerm.toLowerCase();
  return spells.filter(
    spell => 
      spell.name.toLowerCase().includes(term) || 
      spell.description?.toLowerCase().includes(term) ||
      spell.school?.toLowerCase().includes(term)
  );
};

export const filterByLevel = (spells: SpellData[], levelFilters: number[]): SpellData[] => {
  if (!levelFilters.length) return spells;
  return spells.filter(spell => levelFilters.includes(spell.level));
};

export const filterBySchool = (spells: SpellData[], schoolFilters: string[]): SpellData[] => {
  if (!schoolFilters.length) return spells;
  return spells.filter(spell => spell.school && schoolFilters.includes(spell.school));
};

export const filterByClass = (spells: SpellData[], classFilters: string[]): SpellData[] => {
  if (!classFilters.length) return spells;
  
  return spells.filter(spell => {
    if (!spell.classes) return false;
    
    // Handle both string and string[] types for classes
    const spellClasses = Array.isArray(spell.classes) 
      ? spell.classes 
      : spell.classes.split(',').map(cls => cls.trim());
    
    return classFilters.some(cls => 
      spellClasses.some(spellClass => 
        spellClass.toLowerCase().includes(cls.toLowerCase())
      )
    );
  });
};

export const extractClasses = (spells: SpellData[]): string[] => {
  const classesSet = new Set<string>();
  
  spells.forEach(spell => {
    if (!spell.classes) return;
    
    // Handle both string and string[] types for classes
    const spellClasses = Array.isArray(spell.classes) 
      ? spell.classes 
      : spell.classes.split(',').map(cls => cls.trim());
    
    spellClasses.forEach(cls => classesSet.add(cls));
  });
  
  return Array.from(classesSet).sort();
};
