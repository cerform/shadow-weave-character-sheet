
import { CharacterSpell } from '@/types/character';
import { cantrips } from './cantrips';
import { level0 } from './level0';
import { level1 } from './level1';
import { level2 } from './level2';

// Временно добавим мок данные для других уровней
const level3: CharacterSpell[] = [];
const level4: CharacterSpell[] = [];
const level5: CharacterSpell[] = [];
const level6: CharacterSpell[] = [];
const level7: CharacterSpell[] = [];
const level8: CharacterSpell[] = [];
const level9: CharacterSpell[] = [];

// Экспорт заклинаний по уровням
export { level0, cantrips, level1, level2, level3, level4, level5, level6, level7, level8, level9 };

// Объединенный массив всех заклинаний
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

// Функция получения всех заклинаний
export const getAllSpells = () => {
  return spells;
};

// Функция получения заклинаний по классу
export const getSpellsByClass = (className: string) => {
  return spells.filter(spell => {
    if (typeof spell.classes === 'string') {
      return spell.classes.toLowerCase() === className.toLowerCase();
    } else if (Array.isArray(spell.classes)) {
      return spell.classes.some(cls => cls.toLowerCase() === className.toLowerCase());
    }
    return false;
  });
};

// Функция получения заклинаний по уровню
export const getSpellsByLevel = (level: number) => {
  return spells.filter(spell => spell.level === level);
};

// Функция получения конкретного заклинания по имени
export const getSpellDetails = (spellName: string) => {
  return spells.find((spell) => spell.name === spellName) || null;
};
