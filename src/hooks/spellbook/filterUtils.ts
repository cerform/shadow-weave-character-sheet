
import { SpellData } from '@/types/spells';

// Функция фильтрации заклинаний по текстовому поиску
export const filterSpellsByText = (spells: SpellData[], searchText: string): SpellData[] => {
  const lowerSearchText = searchText.toLowerCase().trim();
  
  if (!lowerSearchText) return spells;
  
  return spells.filter(spell => {
    const nameMatch = spell.name.toLowerCase().includes(lowerSearchText);
    const descriptionMatch = typeof spell.description === 'string' && 
      spell.description.toLowerCase().includes(lowerSearchText);
    const schoolMatch = spell.school?.toLowerCase().includes(lowerSearchText);
    
    return nameMatch || descriptionMatch || schoolMatch;
  });
};

// Функция фильтрации заклинаний по уровню
export const filterSpellsByLevel = (spells: SpellData[], levels: number[]): SpellData[] => {
  if (!levels.length) return spells;
  return spells.filter(spell => levels.includes(spell.level));
};

// Функция фильтрации заклинаний по школе магии
export const filterSpellsBySchool = (spells: SpellData[], schools: string[]): SpellData[] => {
  if (!schools.length) return spells;
  return spells.filter(spell => spell.school && schools.includes(spell.school));
};

// Функция фильтрации заклинаний по классу персонажа
export const filterSpellsByClass = (spells: SpellData[], classes: string[]): SpellData[] => {
  if (!classes.length) return spells;
  
  return spells.filter(spell => {
    if (Array.isArray(spell.classes)) {
      return spell.classes.some(cls => classes.includes(cls));
    }
    else if (typeof spell.classes === 'string') {
      return classes.includes(spell.classes);
    }
    return false;
  });
};

// Функция фильтрации заклинаний по ритуальности
export const filterSpellsByRitual = (spells: SpellData[], isRitual: boolean): SpellData[] => {
  return spells.filter(spell => spell.ritual === isRitual);
};

// Функция фильтрации заклинаний по концентрации
export const filterSpellsByConcentration = (spells: SpellData[], isConcentration: boolean): SpellData[] => {
  return spells.filter(spell => spell.concentration === isConcentration);
};
