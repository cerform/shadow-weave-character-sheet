
import { cantrips } from './cantrips'; 
import { level0Spells } from './level0';
import { level1Spells } from './level1';
import { level2Spells } from './level2';
import { level3Spells } from './level3';
import { level4Spells } from './level4';
import { level4Part2Spells } from './level4_part2';
import { level4Part3Spells } from './level4_part3';
import { level5Spells } from './level5';
import { level6Spells } from './level6';
import { level7Spells } from './level7';
import { level8Spells } from './level8';
import { level9Spells } from './level9';

// Объединяем заклинания одного уровня из разных файлов
const combinedLevel4 = [...level4Spells, ...level4Part2Spells, ...level4Part3Spells];

// Создаем полный список заклинаний, объединяя все массивы
export const spells = [
  ...cantrips,
  ...level0Spells,
  ...level1Spells,
  ...level2Spells,
  ...level3Spells,
  ...combinedLevel4,
  ...level5Spells,
  ...level6Spells,
  ...level7Spells,
  ...level8Spells,
  ...level9Spells
];

// Создаем объект для удобного доступа к заклинаниям по уровням
export const spellsByLevel = {
  0: [...cantrips, ...level0Spells],
  1: level1Spells,
  2: level2Spells,
  3: level3Spells,
  4: combinedLevel4,
  5: level5Spells,
  6: level6Spells,
  7: level7Spells,
  8: level8Spells,
  9: level9Spells
};

// Функция для получения заклинаний по классу
export const getSpellsByClass = (className: string) => {
  return spells.filter(spell => {
    if (!spell.classes) return false;
    
    if (Array.isArray(spell.classes)) {
      return spell.classes.includes(className);
    }
    
    return spell.classes === className;
  });
};

// Экспорт по умолчанию для обратной совместимости
export default spells;
