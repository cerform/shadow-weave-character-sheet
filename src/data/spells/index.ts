
import { CharacterSpell } from '@/types/character';
import { cantrips } from './cantrips';
import { level0 } from './level0';
import { level1 } from './level1';
import { level2 } from './level2';
import { level3 } from './level3';
import { level4 } from './level4';
import { level4Part2 } from './level4_part2';
import { level4Part3 } from './level4_part3';
import { level5 } from './level5';  // импортируем как level5
import { level6 } from './level6';
import { level7 } from './level7';
import { level8 } from './level8';
import { level9 } from './level9';

// Add IDs to cantrips and all spell files before processing
const addIdsToSpells = (spells: any[]): CharacterSpell[] => {
  return spells.map(spell => ({
    id: `spell-${(spell.name || '').toLowerCase().replace(/\s+/g, '-')}`,
    ...spell
  }));
};

// Объединяем все заклинания в единый массив
export const spells: CharacterSpell[] = [
  ...addIdsToSpells(cantrips),
  ...addIdsToSpells(level0),
  ...addIdsToSpells(level1),
  ...addIdsToSpells(level2),
  ...addIdsToSpells(level3),
  ...addIdsToSpells(level4),
  ...addIdsToSpells(level4Part2),
  ...addIdsToSpells(level4Part3),
  ...addIdsToSpells(level5),
  ...addIdsToSpells(level6),
  ...addIdsToSpells(level7),
  ...addIdsToSpells(level8),
  ...addIdsToSpells(level9)
];

// Функция для получения заклинаний по классу
export const getSpellsByClass = (className: string): CharacterSpell[] => {
  return spells.filter(spell => {
    if (Array.isArray(spell.classes)) {
      return spell.classes.some(cls => cls.toLowerCase() === className.toLowerCase());
    } else if (typeof spell.classes === 'string') {
      return spell.classes.toLowerCase() === className.toLowerCase();
    }
    return false;
  });
};

// Функция для получения заклинаний по уровню
export const getSpellsByLevel = (level: number): CharacterSpell[] => {
  return spells.filter(spell => spell.level === level);
};

// Функция для получения всех заклинаний
export const getAllSpells = (): CharacterSpell[] => {
  return spells;
};

// Функция для поиска заклинания по имени
export const getSpellByName = (name: string): CharacterSpell | undefined => {
  return spells.find(spell => 
    spell.name.toLowerCase() === name.toLowerCase()
  );
};

// Функция для получения заклинаний по школе магии
export const getSpellsBySchool = (school: string): CharacterSpell[] => {
  return spells.filter(spell => 
    spell.school?.toLowerCase() === school.toLowerCase()
  );
};

// Функция для фильтрации заклинаний по разным критериям
export const filterSpells = (options: {
  searchTerm?: string;
  level?: number[];
  school?: string[];
  className?: string[];
  ritual?: boolean;
  concentration?: boolean;
}): CharacterSpell[] => {
  return spells.filter(spell => {
    // Поиск по названию
    if (options.searchTerm && !spell.name.toLowerCase().includes(options.searchTerm.toLowerCase())) {
      return false;
    }
    
    // Фильтр по уровню
    if (options.level && options.level.length > 0 && !options.level.includes(spell.level)) {
      return false;
    }
    
    // Фильтр по школе
    if (options.school && options.school.length > 0 && !options.school.includes(spell.school || '')) {
      return false;
    }
    
    // Фильтр по классу
    if (options.className && options.className.length > 0) {
      if (Array.isArray(spell.classes)) {
        if (!spell.classes.some(cls => options.className?.includes(cls))) {
          return false;
        }
      } else if (typeof spell.classes === 'string') {
        if (!options.className.includes(spell.classes)) {
          return false;
        }
      }
    }
    
    // Фильтр по ритуальным заклинаниям
    if (options.ritual && !spell.ritual) {
      return false;
    }
    
    // Фильтр по заклинаниям с концентрацией
    if (options.concentration && !spell.concentration) {
      return false;
    }
    
    return true;
  });
};

// Add additional utility functions to help fix errors
export const isSpellAdded = (spellId: string, spells: CharacterSpell[]): boolean => {
  return spells.some(spell => spell.id === spellId);
};

export const convertSpellsForState = (spells: CharacterSpell[]): CharacterSpell[] => {
  return spells.map(spell => ({
    ...spell,
    id: spell.id || `spell-${spell.name.toLowerCase().replace(/\s+/g, '-')}`
  }));
};
