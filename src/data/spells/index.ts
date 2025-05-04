
import { CharacterSpell } from '@/types/character';
import { cantrips } from './cantrips';
import { level1 } from './level1';
import { level2 } from './level2';
import { level3 } from './level3';
import { level4 } from './level4';
import { level5 } from './level5';
import { level6 } from './level6';
import { level7 } from './level7';
import { level8 } from './level8';
import { level9 } from './level9';

// Объединяем все заклинания в один массив
export const spells: CharacterSpell[] = [
  ...cantrips,
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

// Функция для проверки, существует ли указанное заклинание
export const spellExists = (name: string): boolean => {
  return spells.some(spell => spell.name.toLowerCase() === name.toLowerCase());
};

// Функция для получения всех заклинаний
export const getAllSpells = (): CharacterSpell[] => {
  return spells;
};

// Функция для получения деталей заклинания по имени
export const getSpellDetails = (name: string): CharacterSpell | undefined => {
  // Проверяем, является ли name строкой
  if (typeof name !== 'string') {
    // Если name - объект типа CharacterSpell, возвращаем его
    if (name && typeof name === 'object' && 'name' in name && 'level' in name) {
      return name as CharacterSpell;
    }
    return undefined;
  }
  
  // Ищем заклинание по имени
  return spells.find(spell => spell.name.toLowerCase() === name.toLowerCase());
};

// Функция для безопасного доступа к свойству classes с проверкой типа
export const getSpellClasses = (spell: CharacterSpell): string[] => {
  if (!spell.classes) {
    return [];
  }
  
  if (Array.isArray(spell.classes)) {
    return spell.classes;
  }
  
  if (typeof spell.classes === 'string') {
    return spell.classes.split(', ').map(c => c.trim());
  }
  
  return [];
};

// Функция для фильтрации заклинаний по классу
export const getSpellsByClass = (className: string): CharacterSpell[] => {
  return spells.filter(spell => {
    const classes = getSpellClasses(spell);
    return classes.some(c => c.toLowerCase().includes(className.toLowerCase()));
  });
};

// Функция для фильтрации заклинаний по уровню
export const getSpellsByLevel = (level: number): CharacterSpell[] => {
  return spells.filter(spell => spell.level === level);
};
