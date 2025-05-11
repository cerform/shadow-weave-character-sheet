
import { CharacterSpell } from '@/types/character';
import { SpellData } from '@/types/spells';

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

// Преобразование заклинаний персонажа в SpellData для отображения
export const convertCharacterSpellsToSpellData = (spells: any[]): SpellData[] => {
  if (!spells || !Array.isArray(spells)) return [];
  
  return spells.map(spell => {
    if (typeof spell === 'string') {
      // Если заклинание представлено строкой, создаем минимальный объект
      return {
        id: `spell-${spell.replace(/\s+/g, '-').toLowerCase()}`,
        name: spell,
        level: 0,
        school: 'Универсальная',
        castingTime: '1 действие',
        range: 'Касание',
        components: '',
        duration: 'Мгновенная',
        description: '',
        classes: [],
      };
    } else {
      // Если это объект заклинания, убеждаемся что у него есть id
      return {
        ...spell,
        id: spell.id || `spell-${spell.name.replace(/\s+/g, '-').toLowerCase()}`,
        school: spell.school || 'Универсальная',
        castingTime: spell.castingTime || '1 действие',
        range: spell.range || 'Касание',
        components: spell.components || '',
        duration: spell.duration || 'Мгновенная',
        classes: spell.classes || []
      };
    }
  });
};

// Проверка, может ли персонаж подготовить еще заклинания
export const canPrepareMoreSpells = (
  character: any,
  preparedCount: number
): boolean => {
  if (!character) return false;
  
  // Вычисляем лимит подготовленных заклинаний на основе характеристик и класса
  const preparedSpellsLimit = getPreparedSpellsLimit(character);
  
  return preparedCount < preparedSpellsLimit;
};

// Получить максимальное количество заклинаний, которое может подготовить персонаж
export const getPreparedSpellsLimit = (character: any): number => {
  if (!character) return 0;
  
  const characterClass = character.class?.toLowerCase() || '';
  const level = character.level || 1;
  
  // Получаем модификатор базовой характеристики
  let abilityModifier = 0;
  
  if (character.abilities) {
    if (['жрец', 'друид', 'cleric', 'druid'].includes(characterClass)) {
      // Мудрость
      const wisdom = character.abilities?.wisdom || character.abilities?.WIS || character.wisdom || 10;
      abilityModifier = Math.floor((wisdom - 10) / 2);
    } else if (['волшебник', 'маг', 'wizard'].includes(characterClass)) {
      // Интеллект
      const intelligence = character.abilities?.intelligence || character.abilities?.INT || character.intelligence || 10;
      abilityModifier = Math.floor((intelligence - 10) / 2);
    } else {
      // Харизма (бард, колдун, чародей, паладин)
      const charisma = character.abilities?.charisma || character.abilities?.CHA || character.charisma || 10;
      abilityModifier = Math.floor((charisma - 10) / 2);
    }
  }
  
  // Рассчитываем максимальное количество подготовленных заклинаний в зависимости от класса
  if (['жрец', 'друид', 'cleric', 'druid'].includes(characterClass)) {
    return level + abilityModifier;
  } else if (['паладин', 'paladin'].includes(characterClass)) {
    // Паладины могут подготовить (уровень / 2 + модификатор харизмы)
    return Math.floor(level / 2) + abilityModifier;
  } else if (['волшебник', 'маг', 'wizard'].includes(characterClass)) {
    return level + abilityModifier;
  }
  
  // Для бардов, чародеев и колдунов количество известных заклинаний фиксировано
  return Infinity; // Они не "готовят" заклинания каждый день
};

// Нормализация массива заклинаний
export const normalizeSpells = (spells: any[]): CharacterSpell[] => {
  if (!spells || !Array.isArray(spells)) return [];
  
  return spells.map(spell => {
    if (typeof spell === 'string') {
      return convertStringToCharacterSpell(spell);
    }
    return spell;
  });
};

// Преобразование объектов заклинаний в SpellData
export const convertToSpellData = (spell: CharacterSpell): SpellData => {
  return {
    id: spell.id?.toString() || `spell-${spell.name.replace(/\s+/g, '-').toLowerCase()}`,
    name: spell.name,
    level: spell.level,
    school: spell.school || 'Универсальная',
    castingTime: spell.castingTime || '1 действие',
    range: spell.range || 'Касание',
    components: spell.components || '',
    duration: spell.duration || 'Мгновенная',
    description: spell.description || '',
    classes: spell.classes || [],
    ritual: spell.ritual || false,
    concentration: spell.concentration || false
  };
};
