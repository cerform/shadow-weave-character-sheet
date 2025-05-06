
import { Character } from '@/types/character';

// Функция для расчета максимального уровня заклинаний
export const getMaxSpellLevel = (characterClass: string, level: number): number => {
  // По умолчанию для всех классов
  // Уровень персонажа -> максимальный уровень заклинаний
  const spellProgressionByLevel: { [key: number]: number } = {
    1: 1, 2: 1, 3: 2, 4: 2, 5: 3, 6: 3, 7: 4, 8: 4, 9: 5,
    10: 5, 11: 6, 12: 6, 13: 7, 14: 7, 15: 8, 16: 8, 17: 9,
    18: 9, 19: 9, 20: 9
  };
  
  // Для полуклассов заклинателей (Паладин, Следопыт)
  const halfCasterProgression: { [key: number]: number } = {
    1: 0, 2: 1, 3: 1, 4: 1, 5: 2, 6: 2, 7: 2, 8: 2, 9: 3,
    10: 3, 11: 3, 12: 3, 13: 4, 14: 4, 15: 4, 16: 4, 17: 5,
    18: 5, 19: 5, 20: 5
  };
  
  // Для четверть-классов заклинателей (Мастер боевых искусств, Плут)
  const quarterCasterProgression: { [key: number]: number } = {
    1: 0, 2: 0, 3: 1, 4: 1, 5: 1, 6: 1, 7: 2, 8: 2, 9: 2,
    10: 2, 11: 2, 12: 2, 13: 3, 14: 3, 15: 3, 16: 3, 17: 3,
    18: 3, 19: 4, 20: 4
  };

  // Определяем тип заклинателя
  const classLower = characterClass.toLowerCase();
  if (['паладин', 'следопыт'].includes(classLower)) {
    return halfCasterProgression[level] || 0;
  } else if (['мастер боевых искусств', 'плут'].includes(classLower)) {
    return quarterCasterProgression[level] || 0;
  } else {
    return spellProgressionByLevel[level] || 0;
  }
};

// Функция для расчета количества известных заклинаний и заговоров
export const calculateAvailableSpellsByClassAndLevel = (
  characterClass: string, 
  level: number,
  modifier: number = 0
): { maxSpellLevel: number; cantripsCount: number; knownSpells: number } => {
  const classLower = characterClass.toLowerCase();
  // Получаем максимальный уровень заклинаний
  const maxSpellLevel = getMaxSpellLevel(characterClass, level);
  
  // По умолчанию
  let cantripsCount = 3 + Math.floor(level / 4); // Большинство полных заклинателей
  let knownSpells = level + modifier;
  
  // Определяем количество в зависимости от класса
  if (['бард'].includes(classLower)) {
    cantripsCount = 2 + Math.floor((level - 1) / 6);
    // Барды знают: 4 на 1м уровне + 1 за каждый уровень до 20
    knownSpells = 4 + Math.min(level - 1, 15);
  } else if (['чародей'].includes(classLower)) {
    cantripsCount = 4 + Math.floor(level / 6);
    // Чародеи знают: 2 на 1м уровне + 1 за каждый уровень
    knownSpells = 2 + Math.min(level - 1, 15);
  } else if (['колдун'].includes(classLower)) {
    cantripsCount = 2 + Math.floor(level / 6);
    // Колдуны знают: 2 на 1м уровне + 1 за каждый уровень
    knownSpells = 2 + Math.min(level - 1, 15);
  } else if (['волшебник', 'маг'].includes(classLower)) {
    cantripsCount = 3 + Math.floor(level / 5);
    // Волшебники могут подготовить: Инт.мод + уровень персонажа
    knownSpells = level + Math.max(modifier, 1);
  } else if (['жрец', 'друид'].includes(classLower)) {
    cantripsCount = 3 + Math.floor(level / 5);
    // Жрецы и друиды могут подготовить: Мод.мудрости + уровень персонажа
    knownSpells = level + Math.max(modifier, 1);
  } else if (['паладин'].includes(classLower)) {
    cantripsCount = 0; // У паладинов нет заговоров
    knownSpells = Math.floor(level / 2) + Math.max(modifier, 1); // Уровень/2 + мод.хар
  } else if (['следопыт'].includes(classLower)) {
    cantripsCount = 0; // У следопытов нет заговоров
    knownSpells = Math.floor(level / 2) + Math.max(modifier, 1); // Уровень/2 + мод.мудр
  } else {
    // Для других классов, у которых может быть магия
    cantripsCount = Math.floor(level / 4);
    knownSpells = Math.floor(level / 3) + Math.max(modifier, 0);
  }
  
  // Базовые ограничения
  cantripsCount = Math.max(cantripsCount, 0);
  knownSpells = Math.max(knownSpells, 0);
  
  return { maxSpellLevel, cantripsCount, knownSpells };
};

// Функция для нормализации заклинаний (преобразует строки в объекты)
export const normalizeSpells = (character: Character) => {
  if (!character.spells) return [];
  
  return character.spells.map(spell => {
    if (typeof spell === 'string') {
      return {
        name: spell,
        id: `spell-${spell.toLowerCase().replace(/\s+/g, '-')}`,
        level: 0,
        prepared: true,
      };
    }
    return spell;
  });
};

// Вычисляем количество известных заклинаний для персонажа
export const calculateKnownSpells = (character: Character): number => {
  if (!character.class) return 0;
  
  const { knownSpells } = calculateAvailableSpellsByClassAndLevel(
    character.class,
    character.level || 1,
    0 // Используем 0 как модификатор по умолчанию
  );
  
  return knownSpells;
};

// Получаем лимит на количество подготовленных заклинаний
export const getPreparedSpellsLimit = (character: Character): number => {
  if (!character.class) return 0;
  
  const classLower = character.class.toLowerCase();
  let modifier = 0;
  
  // Определяем модификатор в зависимости от класса
  if (['жрец', 'друид'].includes(classLower)) {
    // Мудрость
    modifier = Math.floor((character.wisdom || 10) - 10) / 2;
  } else if (['волшебник', 'маг'].includes(classLower)) {
    // Интеллект
    modifier = Math.floor((character.intelligence || 10) - 10) / 2;
  } else if (['паладин'].includes(classLower)) {
    // Харизма
    modifier = Math.floor((character.charisma || 10) - 10) / 2;
  } else if (['следопыт'].includes(classLower)) {
    // Мудрость
    modifier = Math.floor((character.wisdom || 10) - 10) / 2;
  }
  
  // Вычисляем лимит
  if (['жрец', 'друид', 'волшебник', 'маг'].includes(classLower)) {
    return character.level + Math.max(modifier, 1);
  } else if (['паладин', 'следопыт'].includes(classLower)) {
    return Math.floor(character.level / 2) + Math.max(modifier, 1);
  }
  
  // Для классов, которые не подготавливают заклинания
  return 0;
};

// Проверяем, может ли персонаж подготовить еще заклинания
export const canPrepareMoreSpells = (character: Character): boolean => {
  if (!character.spells) return true;
  
  const preparedLimit = getPreparedSpellsLimit(character);
  if (preparedLimit === 0) return false; // Этот класс не подготавливает заклинания
  
  // Считаем количество уже подготовленных заклинаний
  const preparedCount = character.spells.filter(spell => {
    if (typeof spell === 'string') return false;
    return spell.prepared && spell.level > 0; // Заговоры не учитываются
  }).length;
  
  return preparedCount < preparedLimit;
};
