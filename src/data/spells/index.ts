
import { CharacterSpell } from '@/types/character';
import { cantrips } from './all_cantrips';
import { level0 } from './level0';
import { level1 } from './level1';
import { level2 } from './level2';
import { level3 } from './level3';
import { level4 } from './level4';
import { level4Part2 } from './level4_part2';
import { level4Part3 } from './level4_part3';
import { level5 } from './level5';
import { level6 } from './level6';
import { level7 } from './level7';
import { level8 } from './level8';
import { level9 } from './level9';
import { removeDuplicateSpells } from '@/utils/spellProcessors';
import { SpellData } from '@/types/spells';

// Функция для генерации уникального ID для заклинания
function generateSpellId(spell: CharacterSpell, index: number): string {
  return spell.id?.toString() || 
    `spell-${index}-${spell.name.toLowerCase().replace(/\s+/g, '-')}`;
}

// Объединяем все заклинания в единый массив
console.log("Загрузка всех файлов заклинаний:");
console.log(`cantrips: ${cantrips?.length || 0}`);
console.log(`level0: ${level0?.length || 0}`);
console.log(`level1: ${level1?.length || 0}`);
console.log(`level2: ${level2?.length || 0}`);
console.log(`level3: ${level3?.length || 0}`);
console.log(`level4: ${level4?.length || 0}`);

const allSpellsWithDuplicates: CharacterSpell[] = [
  ...(Array.isArray(cantrips) ? cantrips : []),
  ...(Array.isArray(level0) ? level0 : []),
  ...(Array.isArray(level1) ? level1 : []),
  ...(Array.isArray(level2) ? level2 : []),
  ...(Array.isArray(level3) ? level3 : []),
  ...(Array.isArray(level4) ? level4 : []),
  ...(Array.isArray(level4Part2) ? level4Part2 : []),
  ...(Array.isArray(level4Part3) ? level4Part3 : []),
  ...(Array.isArray(level5) ? level5 : []),
  ...(Array.isArray(level6) ? level6 : []),
  ...(Array.isArray(level7) ? level7 : []),
  ...(Array.isArray(level8) ? level8 : []),
  ...(Array.isArray(level9) ? level9 : [])
].map((spell, index) => ({
  ...spell,
  id: generateSpellId(spell, index)
}));

// Удаляем дубликаты
export const spells: CharacterSpell[] = removeDuplicateSpells(allSpellsWithDuplicates);

console.log(`Всего загружено заклинаний (после удаления дубликатов): ${spells.length}`);

// Функция для получения заклинаний по классу
export const getSpellsByClass = (className: string): CharacterSpell[] => {
  console.log(`Ищу заклинания для класса: ${className}, всего заклинаний: ${spells.length}`);
  return spells.filter(spell => {
    if (Array.isArray(spell.classes)) {
      return spell.classes.some(cls => 
        typeof cls === 'string' && cls.toLowerCase() === className.toLowerCase()
      );
    } else if (typeof spell.classes === 'string') {
      return spell.classes.toLowerCase() === className.toLowerCase();
    }
    return false;
  });
};

// Функция для получения заклинаний по уровню
export const getSpellsByLevel = (level: number): CharacterSpell[] => {
  console.log(`Ищу заклинания для уровня: ${level}, всего заклинаний: ${spells.length}`);
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
    spell.school && spell.school.toLowerCase() === school.toLowerCase()
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
    if (options.school && options.school.length > 0) {
      if (!spell.school || !options.school.includes(spell.school)) {
        return false;
      }
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
      } else {
        return false; // Нет классов у заклинания
      }
    }
    
    // Фильтр по ритуальным заклинаниям
    if (options.ritual !== undefined && spell.ritual !== options.ritual) {
      return false;
    }
    
    // Фильтр по заклинаниям с концентрацией
    if (options.concentration !== undefined && spell.concentration !== options.concentration) {
      return false;
    }
    
    return true;
  });
};
