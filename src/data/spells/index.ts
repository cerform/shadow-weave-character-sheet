
import { CharacterSpell } from '@/types/character';
import { cantrips } from './cantrips';
import { level0 } from './level0';
import { level1 } from './level1';
import { level2 } from './level2';
import { level3 } from './level3';
import { level4 } from './level4';
import { level5 } from './level5';
import { level6 } from './level6';
import { level7 } from './level7';
import { level8 } from './level8';
import { level9 } from './level9';

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
export const getSpellsByClass = (className: string): CharacterSpell[] => {
  return spells.filter(spell => {
    if (typeof spell.classes === 'string') {
      return spell.classes.toLowerCase().includes(className.toLowerCase());
    }
    if (Array.isArray(spell.classes)) {
      return spell.classes.some(cls => 
        typeof cls === 'string' && cls.toLowerCase().includes(className.toLowerCase())
      );
    }
    return false;
  });
};

/**
 * Получает заклинания по школе
 */
export const getSpellsBySchool = (school: string): CharacterSpell[] => {
  return spells.filter(spell => spell.school === school);
};
