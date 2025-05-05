
// Импортируем все файлы с заклинаниями
import { cantrips } from './cantrips';
import { level0 } from './level0';
import { level1 } from './level1';
import { level2 } from './level2';
import { level3 } from './level3';
import { level4 } from './level4';
import { level4_part2 } from './level4_part2';
import { level4_part3 } from './level4_part3';
import { level5 } from './level5';
import { level6 } from './level6';
import { level7 } from './level7';
import { level8 } from './level8';
import { level9 } from './level9';
import { CharacterSpell } from '@/types/character';

// Объединяем все заклинания в один массив
export const spells: CharacterSpell[] = [
  ...cantrips,
  ...level0,
  ...level1,
  ...level2,
  ...level3,
  ...level4,
  ...level4_part2,
  ...level4_part3,
  ...level5,
  ...level6,
  ...level7,
  ...level8,
  ...level9
];

// Для совместимости с существующим кодом
export const getSpellDetails = (spellName: string) => {
  // Используем импортированный массив заклинаний
  return spells.find((spell) => spell.name === spellName) || null;
};

// Добавляем функцию getAllSpells для SpellPanel
export const getAllSpells = () => {
  return spells;
};

// Функция получения заклинаний по классу
export const getSpellsByClass = (className: string) => {
  if (!className) return [];
  
  return spells.filter(spell => {
    if (!spell.classes) return false;
    
    if (Array.isArray(spell.classes)) {
      return spell.classes.some(c => c.includes(className));
    }
    
    if (typeof spell.classes === 'string') {
      return spell.classes.includes(className);
    }
    
    return false;
  });
};

// Функция получения заклинаний по уровню
export const getSpellsByLevel = (level: number) => {
  return spells.filter(spell => spell.level === level);
};
