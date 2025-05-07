import { cantrips } from "./cantrips";
import { level1 } from "./level1";
import { level2 } from "./level2";
import { level3 } from "./level3";
import { level4 } from "./level4";
import { level4Part2 } from "./level4_part2";
import { level4Part3 } from "./level4_part3";
import { level5 } from "./level5";
import { level6 } from "./level6";
import { level7 } from "./level7";
import { level8 } from "./level8";
import { level9 } from "./level9";
import { CharacterSpell } from "@/types/character";
import { SpellData } from "@/types/spells";
import { createSpellId } from "@/utils/spellHelpers";

// Combine all spell levels into a single array
export const spells: CharacterSpell[] = [
  ...cantrips,
  ...level1,
  ...level2,
  ...level3,
  ...level4,
  ...level4Part2,
  ...level4Part3,
  ...level5,
  ...level6,
  ...level7,
  ...level8,
  ...level9
];

// Генерируем id для всех заклинаний, если их нет
export const ensureSpellIds = (spellsList: CharacterSpell[]): CharacterSpell[] => {
  return spellsList.map(spell => {
    if (!spell.id) {
      return {
        ...spell,
        id: createSpellId(spell.name)
      };
    }
    return spell;
  });
};

// Get spells by level
export const getSpellsByLevel = (level: number): CharacterSpell[] => {
  return ensureSpellIds(spells.filter(spell => spell.level === level));
};

// Convert spell level to text
export const spellLevelToText = (level: number): string => {
  if (level === 0) return "Заговор";
  return `${level}-й уровень`;
};

// Get spells by class - fixed to handle both string and string[] cases
export const getSpellsByClass = (className: string): CharacterSpell[] => {
  if (!className) return [];
  
  const normalizedClassName = className ? className.toLowerCase() : '';
  
  return ensureSpellIds(spells.filter((spell) => {
    if (!spell.classes) return false;
    
    // Check type of classes and safely access
    if (Array.isArray(spell.classes)) {
      return spell.classes.some(
        (spellClass) => 
          spellClass && 
          typeof spellClass === 'string' && 
          spellClass.toLowerCase() === normalizedClassName
      );
    } else if (typeof spell.classes === 'string') {
      return spell.classes.toLowerCase() === normalizedClassName;
    }
    
    return false;
  }));
};

// Get spell details by name
export const getSpellDetails = (spellName: string): CharacterSpell | undefined => {
  if (!spellName) return undefined;
  
  return spells.find(
    (spell) => spell && spell.name && spell.name.toLowerCase() === (spellName?.toLowerCase() || '')
  );
};

// Get spells by school
export const getSpellsBySchool = (school: string): CharacterSpell[] => {
  if (!school) return [];
  
  return ensureSpellIds(spells.filter(
    (spell) => spell && spell.school && spell.school.toLowerCase() === school.toLowerCase()
  ));
};

// Get available spell schools
export const getSpellSchools = (): string[] => {
  const schools = new Set<string>();
  
  spells.forEach(spell => {
    if (spell.school) {
      schools.add(spell.school);
    }
  });
  
  return Array.from(schools);
};

// Export a function to get all spells
export const getAllSpells = (): SpellData[] => {
  console.log('getAllSpells: Начинаю загрузку заклинаний');
  
  // Проверяем, что массив spells не пуст
  if (spells.length === 0) {
    console.error('getAllSpells: Массив заклинаний пуст. Проверьте импорты заклинаний.');
    return [];
  }
  
  console.log('getAllSpells: Найдено заклинаний:', spells.length);
  
  // Убедимся, что все заклинания имеют id
  const spellsWithIds = ensureSpellIds(spells);
  
  // Преобразуем CharacterSpell[] в SpellData[]
  const convertedSpells = spellsWithIds.map(spell => ({
    id: spell.id,
    name: spell.name,
    name_en: spell.name_en,
    level: spell.level,
    school: spell.school || '',
    castingTime: spell.castingTime || '',
    range: spell.range || '',
    components: spell.components || '',
    duration: spell.duration || '',
    description: spell.description || '',
    classes: spell.classes || [],
    ritual: spell.ritual || false,
    concentration: spell.concentration || false,
    verbal: spell.verbal || false,
    somatic: spell.somatic || false,
    material: spell.material || false,
    prepared: spell.prepared || false,
    higherLevel: spell.higherLevel || spell.higherLevels || '',
    higherLevels: spell.higherLevels || spell.higherLevel || '',
    materials: spell.materials || ''
  }));

  console.log('getAllSpells: Преобразовано заклинаний:', convertedSpells.length);
  return convertedSpells;
};

// Filter spells based on provided filters
export const filterSpells = (spells: SpellData[], filters: any): SpellData[] => {
  if (!filters) return spells;
  
  return spells.filter(spell => {
    // Filter by name
    if (filters.name && !spell.name.toLowerCase().includes(filters.name.toLowerCase())) {
      return false;
    }
    
    // Filter by level
    if (filters.level !== undefined) {
      if (Array.isArray(filters.level)) {
        if (filters.level.length > 0 && !filters.level.includes(spell.level)) {
          return false;
        }
      } else if (filters.level !== spell.level) {
        return false;
      }
    }
    
    // Filter by school
    if (filters.school) {
      if (Array.isArray(filters.school)) {
        if (filters.school.length > 0 && !filters.school.includes(spell.school)) {
          return false;
        }
      } else if (filters.school !== spell.school) {
        return false;
      }
    }
    
    // Filter by class
    if (filters.class) {
      const spellClasses = Array.isArray(spell.classes) ? spell.classes : [spell.classes];
      
      if (Array.isArray(filters.class)) {
        if (filters.class.length > 0 && !filters.class.some((c: string) => spellClasses.includes(c))) {
          return false;
        }
      } else if (!spellClasses.includes(filters.class)) {
        return false;
      }
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
};
