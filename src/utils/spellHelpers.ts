
import { CharacterSpell } from '@/types/character';

// Получение уровня заклинания
export const getSpellLevel = (spell: CharacterSpell | string): number => {
  if (typeof spell === 'string') {
    // По умолчанию считаем строковые заклинания заговорами
    return 0;
  }
  return spell.level;
};

// Получение названия уровня заклинания
export const getSpellLevelName = (level: number): string => {
  switch (level) {
    case 0: return 'Заговоры';
    case 1: return '1 уровень';
    case 2: return '2 уровень';
    case 3: return '3 уровень';
    case 4: return '4 уровень';
    case 5: return '5 уровень';
    case 6: return '6 уровень';
    case 7: return '7 уровень';
    case 8: return '8 уровень';
    case 9: return '9 уровень';
    default: return `${level} уровень`;
  }
};

// Проверка, подготовлено ли заклинание
export const isSpellPrepared = (spell: CharacterSpell | string): boolean => {
  if (typeof spell === 'string') {
    // Строковые заклинания считаем всегда подготовленными
    return true;
  }
  return spell.prepared ?? false;
};

// Проверка, является ли заклинание объектом CharacterSpell
export const isCharacterSpellObject = (spell: CharacterSpell | string): spell is CharacterSpell => {
  return typeof spell !== 'string';
};

// Преобразование строкового заклинания в объект
export const convertStringToCharacterSpell = (spellName: string, level: number = 0): CharacterSpell => {
  return {
    name: spellName,
    level,
    prepared: true
  };
};

// Получение списка заклинаний определенного уровня
export const getSpellsByLevel = (
  spells: (CharacterSpell | string)[] | undefined,
  level: number
): (CharacterSpell | string)[] => {
  if (!spells || !Array.isArray(spells)) return [];
  
  return spells.filter(spell => {
    if (typeof spell === 'string') {
      // Строковые заклинания считаем заговорами
      return level === 0;
    }
    return spell.level === level;
  });
};

// Получение списка подготовленных заклинаний
export const getPreparedSpells = (
  spells: (CharacterSpell | string)[] | undefined
): (CharacterSpell | string)[] => {
  if (!spells || !Array.isArray(spells)) return [];
  
  return spells.filter(spell => {
    if (typeof spell === 'string') {
      // Строковые заклинания считаем всегда подготовленными
      return true;
    }
    return spell.prepared === true;
  });
};
