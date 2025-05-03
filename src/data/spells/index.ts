
import { CharacterSpell } from '@/types/character';
import { cantrips } from './cantrips';
// Correcting the imports for level files
import { level1 } from './level1';
import { level2 } from './level2';
import { level3 } from './level3';
import { level4 } from './level4';
import { level5 } from './level5';
import { level6 } from './level6';
import { level7 } from './level7';
import { level8 } from './level8';
import { level9 } from './level9';

// Import level0 correctly - using default import
import level0 from './level0';

// Объединяем все заклинания
export const spells: CharacterSpell[] = [
  ...cantrips,
  ...level0,
  ...level1,
  ...level2,
  ...level3,
  ...level4,
  ...level5,
  ...level6,
  ...level7,
  ...level8,
  ...level9
];

/**
 * Получает заклинания по уровню
 */
export const getSpellsByLevel = (level: number): CharacterSpell[] => {
  return spells.filter(spell => spell.level === level);
};

/**
 * Получает заклинание по имени
 */
export const getSpellByName = (name: string): CharacterSpell | undefined => {
  return spells.find(spell => spell.name === name);
};

/**
 * Получает заклинания по классу
 */
export const getSpellsByClass = (className: string, characterLevel?: number): CharacterSpell[] => {
  if (!className || typeof className !== 'string') {
    return [];
  }
  
  const classNameLower = className.toLowerCase();
  
  return spells.filter(spell => {
    // Проверяем, что classes существует
    if (!spell.classes) {
      return false;
    }
    
    // Если classes это строка
    if (typeof spell.classes === 'string') {
      return spell.classes.toLowerCase().includes(classNameLower);
    }
    
    // Если classes это массив
    if (Array.isArray(spell.classes)) {
      return spell.classes.some(cls => {
        // Добавляем проверку типа перед вызовом toLowerCase()
        if (typeof cls === 'string') {
          return cls.toLowerCase().includes(classNameLower);
        }
        return false;
      });
    }
    
    // Если не строка и не массив, возвращаем false
    return false;
  });
};

/**
 * Получает заклинания по школе
 */
export const getSpellsBySchool = (school: string): CharacterSpell[] => {
  return spells.filter(spell => spell.school === school);
};

/**
 * Получает все имена заклинаний
 */
export const getAllSpellNames = (): string[] => {
  return spells.map(spell => spell.name);
};

/**
 * Возвращает все заклинания
 */
export const getAllSpells = (): CharacterSpell[] => {
  return [...spells];
};
