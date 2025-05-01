
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

export const allSpells: CharacterSpell[] = [
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

// Получить все заклинания
export const getAllSpells = (): CharacterSpell[] => {
  return allSpells;
};

// Получить все названия заклинаний
export const getAllSpellNames = (): string[] => {
  return allSpells.map(spell => spell.name);
};

// Получить детали заклинания по имени
export const getSpellDetails = (spellName: string): CharacterSpell | undefined => {
  return allSpells.find(spell => spell.name === spellName);
};

// Получить заклинания для определённого класса
export const getSpellsByClass = (className: string): CharacterSpell[] => {
  return allSpells.filter(spell => spell.classes.includes(className));
};

// Получить заклинания определённого уровня
export const getSpellsByLevel = (level: number): CharacterSpell[] => {
  return allSpells.filter(spell => spell.level === level);
};

// Получить заклинания определённой школы
export const getSpellsBySchool = (school: string): CharacterSpell[] => {
  return allSpells.filter(spell => spell.school === school);
};

// Экспортируем все заклинания как массив
export const spells: CharacterSpell[] = allSpells;
