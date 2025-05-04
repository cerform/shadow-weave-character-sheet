
import { CharacterSpell } from '@/types/character';
import { SpellData } from './types';

// Функция для проверки, является ли значение строкой
export const isString = (value: any): value is string => {
  return typeof value === 'string';
};

// Функция для проверки, является ли значение массивом строк
export const isStringArray = (value: any): value is string[] => {
  return Array.isArray(value) && value.every(item => typeof item === 'string');
};

// Безопасное соединение значений в строку
export const safeJoin = (classes: string[] | string | undefined): string => {
  if (!classes) return '';
  if (isStringArray(classes)) return classes.join(', ');
  if (isString(classes)) return classes;
  return '';
};

// Фильтр заклинаний по поисковому запросу
export const filterSpellsBySearchTerm = (spells: CharacterSpell[], searchTerm: string): CharacterSpell[] => {
  if (!searchTerm) return spells;
  const lowerSearchTerm = searchTerm.toLowerCase();
  
  return spells.filter(spell => {
    if (isString(spell)) {
      return spell.toLowerCase().includes(lowerSearchTerm);
    }
    if (typeof spell === 'object' && spell && spell.name) {
      return spell.name.toLowerCase().includes(lowerSearchTerm);
    }
    return false;
  });
};

// Фильтр заклинаний по уровню
export const filterSpellsByLevel = (spells: CharacterSpell[], activeLevels: number[]): CharacterSpell[] => {
  if (!activeLevels.length) return spells;
  
  return spells.filter(spell => {
    if (typeof spell === 'object' && spell && typeof spell.level === 'number') {
      return activeLevels.includes(spell.level);
    }
    return false;
  });
};

// Фильтр заклинаний по школе магии
export const filterSpellsBySchool = (spells: CharacterSpell[], activeSchools: string[]): CharacterSpell[] => {
  if (!activeSchools.length) return spells;
  
  return spells.filter(spell => {
    if (typeof spell === 'object' && spell && spell.school) {
      return activeSchools.includes(spell.school);
    }
    return false;
  });
};

// Фильтр заклинаний по классу
export const filterSpellsByClass = (spells: CharacterSpell[], activeClasses: string[]): CharacterSpell[] => {
  if (!activeClasses.length) return spells;
  
  return spells.filter(spell => {
    if (typeof spell === 'object' && spell && spell.classes) {
      if (isStringArray(spell.classes)) {
        return spell.classes.some(cls => activeClasses.includes(cls));
      } 
      if (isString(spell.classes)) {
        return activeClasses.includes(spell.classes);
      }
    }
    return false;
  });
};

// Функция для извлечения всех уникальных классов из заклинаний
export const extractClasses = (spells: CharacterSpell[]): string[] => {
  const classes = new Set<string>();
  
  spells.forEach(spell => {
    if (typeof spell === 'object' && spell && spell.classes) {
      if (isStringArray(spell.classes)) {
        spell.classes.forEach(cls => classes.add(cls));
      } else if (isString(spell.classes)) {
        classes.add(spell.classes);
      }
    }
  });
  
  return Array.from(classes).sort();
};

// Функция для форматирования списка классов
export const formatClasses = (classes: string[] | string | undefined): string => {
  return safeJoin(classes);
};

// Конвертация CharacterSpell в SpellData
export const convertToSpellData = (spell: CharacterSpell): SpellData => {
  return {
    ...spell,
    id: typeof spell.id === 'number' ? spell.id : 0,
    isRitual: !!spell.ritual,
    isConcentration: !!spell.concentration,
    castingTime: spell.castingTime || "",
    toString: () => spell.name,
  };
};
