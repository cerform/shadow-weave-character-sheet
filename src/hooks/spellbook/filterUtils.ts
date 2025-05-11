
import { CharacterSpell } from "@/types/character";
import { SpellData } from "@/types/spells";

// Функция фильтрации заклинаний по уровню
export const filterSpellsByLevel = (spells: SpellData[] | CharacterSpell[] | undefined, level: number): SpellData[] | CharacterSpell[] => {
  if (!spells || !Array.isArray(spells)) return [];
  return spells.filter(spell => spell.level === level);
};

// Функция фильтрации заклинаний по школе магии
export const filterSpellsBySchool = (spells: SpellData[] | CharacterSpell[] | undefined, school: string): SpellData[] | CharacterSpell[] => {
  if (!spells || !Array.isArray(spells)) return [];
  return spells.filter(spell => spell.school?.toLowerCase() === school.toLowerCase());
};

// Функция фильтрации заклинаний по классу
export const filterSpellsByClass = (spells: SpellData[] | CharacterSpell[] | undefined, className: string): SpellData[] | CharacterSpell[] => {
  if (!spells || !Array.isArray(spells)) return [];
  
  return spells.filter(spell => {
    if (!spell.classes) return false;
    
    if (Array.isArray(spell.classes)) {
      return spell.classes.some(cls => {
        if (typeof cls === 'string') {
          return cls.toLowerCase() === className.toLowerCase();
        }
        return false;
      });
    } else if (typeof spell.classes === 'string') {
      return spell.classes.toLowerCase() === className.toLowerCase();
    }
    
    return false;
  });
};

// Функция фильтрации заклинаний по поисковому запросу
export const filterSpellsBySearch = (spells: SpellData[] | CharacterSpell[] | undefined, search: string): SpellData[] | CharacterSpell[] => {
  if (!spells || !Array.isArray(spells) || !search) return spells || [];
  
  const searchLower = search.toLowerCase();
  return spells.filter(spell => 
    spell.name.toLowerCase().includes(searchLower) ||
    (spell.description && typeof spell.description === 'string' && spell.description.toLowerCase().includes(searchLower)) ||
    (spell.school && spell.school.toLowerCase().includes(searchLower))
  );
};

// Общая функция фильтрации заклинаний
export const filterSpells = (spells: SpellData[] | CharacterSpell[] | undefined, filters: {
  level?: number;
  school?: string;
  className?: string;
  search?: string;
  ritual?: boolean;
  concentration?: boolean;
}): SpellData[] | CharacterSpell[] => {
  if (!spells || !Array.isArray(spells)) return [];
  
  let filteredSpells = [...spells];
  
  if (filters.level !== undefined) {
    filteredSpells = filterSpellsByLevel(filteredSpells, filters.level);
  }
  
  if (filters.school) {
    filteredSpells = filterSpellsBySchool(filteredSpells, filters.school);
  }
  
  if (filters.className) {
    filteredSpells = filterSpellsByClass(filteredSpells, filters.className);
  }
  
  if (filters.search) {
    filteredSpells = filterSpellsBySearch(filteredSpells, filters.search);
  }
  
  if (filters.ritual !== undefined) {
    filteredSpells = filteredSpells.filter(spell => spell.ritual === filters.ritual);
  }
  
  if (filters.concentration !== undefined) {
    filteredSpells = filteredSpells.filter(spell => spell.concentration === filters.concentration);
  }
  
  return filteredSpells;
};
