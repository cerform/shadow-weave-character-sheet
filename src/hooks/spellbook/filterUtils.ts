
import { safeSome, safeFilter } from '@/utils/spellUtils';
import { CharacterSpell, SpellData } from '@/types/character';

// Функция для поиска по имени заклинания
export const filterSpellsByName = (spells: SpellData[], searchTerm: string): SpellData[] => {
  if (!searchTerm.trim()) return spells;
  return safeFilter(spells, (spell) => safeSome(spell.name, searchTerm));
};

// Переименуем функцию для обратной совместимости
export const filterBySearchTerm = filterSpellsByName;

// Функция для фильтрации по школе магии
export const filterSpellsBySchool = (spells: SpellData[], schools: string[]): SpellData[] => {
  if (!schools.length) return spells;
  return safeFilter(spells, (spell) => {
    if (!spell.school) return false;
    return schools.some(school => safeSome(spell.school, school));
  });
};

// Переименуем функцию для обратной совместимости
export const filterBySchool = filterSpellsBySchool;

// Функция для фильтрации по уровню заклинания
export const filterSpellsByLevel = (spells: SpellData[], levels: number[]): SpellData[] => {
  if (!levels.length) return spells;
  return safeFilter(spells, (spell) => levels.includes(spell.level));
};

// Переименуем функцию для обратной совместимости
export const filterByLevel = filterSpellsByLevel;

// Функция для фильтрации по компонентам заклинания
export const filterSpellsByComponents = (
  spells: SpellData[], 
  components: { verbal?: boolean; somatic?: boolean; material?: boolean }
): SpellData[] => {
  const { verbal, somatic, material } = components;
  if (!verbal && !somatic && !material) return spells;
  
  return safeFilter(spells, (spell) => {
    if (verbal && !spell.verbal) return false;
    if (somatic && !spell.somatic) return false;
    if (material && !spell.material) return false;
    return true;
  });
};

// Функция для фильтрации по классу персонажа
export const filterSpellsByClass = (spells: SpellData[], classes: string[]): SpellData[] => {
  if (!classes.length) return spells;
  
  return safeFilter(spells, (spell) => {
    if (!spell.classes) return false;
    
    if (Array.isArray(spell.classes)) {
      return spell.classes.some(spellClass => 
        classes.some(className => safeSome(spellClass, className))
      );
    }
    
    if (typeof spell.classes === 'string') {
      return classes.some(className => safeSome(spell.classes as string, className));
    }
    
    return false;
  });
};

// Переименуем функцию для обратной совместимости
export const filterByClass = filterSpellsByClass;

// Функция для фильтрации по подготовленным заклинаниям
export const filterSpellsByPrepared = (spells: SpellData[], showPrepared: boolean): SpellData[] => {
  if (!showPrepared) return spells;
  return safeFilter(spells, (spell) => spell.prepared === true);
};

// Функция для извлечения доступных классов из списка заклинаний
export const extractClasses = (spells: SpellData[]): string[] => {
  const classesSet = new Set<string>();
  
  spells.forEach(spell => {
    if (!spell.classes) return;
    
    if (Array.isArray(spell.classes)) {
      spell.classes.forEach(spellClass => {
        if (typeof spellClass === 'string') {
          classesSet.add(spellClass);
        }
      });
    } else if (typeof spell.classes === 'string') {
      classesSet.add(spell.classes);
    }
  });
  
  return Array.from(classesSet).sort();
};
