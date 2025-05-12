
import { Character } from '@/types/character';
import { SpellData } from '@/types/spells';

/**
 * Вычисляет максимальное число заклинаний, доступных классу на определенном уровне
 */
export const calculateAvailableSpellsByClassAndLevel = (characterClass: string, level: number) => {
  const classLower = characterClass.toLowerCase();
  
  // Базовые параметры для разных классов заклинателей
  if (['жрец', 'друид', 'волшебник', 'cleric', 'druid', 'wizard'].includes(classLower)) {
    // Классы с полным доступом к заклинаниям
    return {
      cantripsKnown: Math.min(5, 3 + Math.floor(level / 4)),
      knownSpells: level + 1, // Для подготовки (уровень + модификатор способности)
      maxSpellLevel: Math.min(9, Math.ceil(level / 2))
    };
  } else if (['бард', 'следопыт', 'bard', 'ranger'].includes(classLower)) {
    // Классы с ограниченным набором заклинаний
    return {
      cantripsKnown: Math.min(4, 2 + Math.floor(level / 6)),
      spellsKnown: level + 3,
      maxSpellLevel: Math.min(9, Math.ceil(level / 2))
    };
  } else if (['чародей', 'колдун', 'sorcerer', 'warlock'].includes(classLower)) {
    // Классы с очень ограниченным набором заклинаний
    return {
      cantripsKnown: Math.min(6, 4 + Math.floor(level / 6)),
      spellsKnown: level + 1,
      maxSpellLevel: Math.min(9, Math.ceil(level / 2))
    };
  } else if (['паладин', 'paladin'].includes(classLower)) {
    // Паладины получают заклинания с 2-го уровня
    if (level < 2) {
      return { cantripsKnown: 0, knownSpells: 0, maxSpellLevel: 0 };
    }
    return {
      cantripsKnown: 0,
      knownSpells: Math.floor(level / 2) + 1,
      maxSpellLevel: Math.min(5, Math.ceil(level / 4))
    };
  }
  
  // Для не-магических классов
  return {
    cantripsKnown: 0,
    knownSpells: 0,
    maxSpellLevel: 0
  };
};

/**
 * Проверяет, может ли персонаж подготовить больше заклинаний
 */
export const canPrepareMoreSpells = (character: Character): boolean => {
  if (!character.spellcasting || !character.spells) return false;

  // Получаем лимит подготовленных заклинаний
  const preparedLimit = getPreparedSpellsLimit(character);
  
  // Считаем количество уже подготовленных заклинаний
  let preparedCount = 0;
  character.spells.forEach(spell => {
    if (typeof spell === 'object' && spell?.prepared && spell.level > 0) {
      preparedCount++;
    }
  });
  
  return preparedCount < preparedLimit;
};

/**
 * Получает лимит подготовленных заклинаний для персонажа
 */
export const getPreparedSpellsLimit = (character: Character): number => {
  if (!character.spellcasting) return 0;

  // Если лимит уже указан в свойстве preparedSpellsLimit
  if (character.spellcasting.preparedSpellsLimit !== undefined) {
    return character.spellcasting.preparedSpellsLimit;
  }

  // Для классов, которые готовят заклинания (жрец, друид, волшебник и т.д.)
  const classLower = character.class.toLowerCase();
  if (['жрец', 'друид', 'волшебник', 'cleric', 'druid', 'wizard', 'паладин', 'paladin'].includes(classLower)) {
    // Базовая формула: уровень персонажа + модификатор способности заклинаний
    const abilityName = character.spellcasting.ability || 'intelligence';
    const abilityScore = character[abilityName.toLowerCase() as keyof Character] as number;
    const abilityModifier = Math.floor((abilityScore - 10) / 2);
    
    // Для паладинов: уровень / 2 + модификатор харизмы
    if (['паладин', 'paladin'].includes(classLower)) {
      return Math.floor(character.level / 2) + abilityModifier;
    }
    
    return character.level + abilityModifier;
  }
  
  // Для классов, которые знают фиксированное количество заклинаний (бард, чародей)
  return 0; // Эти классы не готовят заклинания, а просто знают их
};

/**
 * Получает модификатор заклинательной способности персонажа
 */
export const getSpellcastingAbilityModifier = (character: Character): number => {
  if (!character || !character.class) return 0;
  
  const classLower = character.class.toLowerCase();
  
  if (['жрец', 'друид', 'cleric', 'druid'].includes(classLower)) {
    // Мудрость
    const wisdom = character.wisdom || 10;
    return Math.floor((wisdom - 10) / 2);
  } else if (['волшебник', 'маг', 'wizard'].includes(classLower)) {
    // Интеллект
    const intelligence = character.intelligence || 10;
    return Math.floor((intelligence - 10) / 2);
  } else {
    // Харизма (бард, колдун, чародей, паладин)
    const charisma = character.charisma || 10;
    return Math.floor((charisma - 10) / 2);
  }
};

/**
 * Возвращает максимальный уровень заклинаний для заданного класса и уровня персонажа
 */
export const getMaxSpellLevel = (characterClass: string, characterLevel: number): number => {
  if (!characterClass) return 0;
  
  const classLower = typeof characterClass === 'string' ? characterClass.toLowerCase() : '';
  
  if (['волшебник', 'маг', 'wizard', 'жрец', 'cleric', 'бард', 'bard', 'друид', 'druid', 'чародей', 'sorcerer'].includes(classLower)) {
    return Math.min(9, Math.ceil(characterLevel / 2));
  } else if (['колдун', 'warlock'].includes(classLower)) {
    return Math.min(5, Math.ceil(characterLevel / 2));
  } else if (['паладин', 'paladin', 'рейнджер', 'следопыт', 'ranger'].includes(classLower)) {
    return Math.min(5, Math.ceil(characterLevel / 4));
  }
  
  return 0;
};

/**
 * Фильтрует заклинания по классу и уровню персонажа
 */
export const filterSpellsByClassAndLevel = (
  spells: SpellData[], 
  characterClass: string, 
  characterLevel: number
): SpellData[] => {
  if (!spells || !Array.isArray(spells) || spells.length === 0 || !characterClass) {
    return [];
  }
  
  const maxSpellLevel = getMaxSpellLevel(characterClass, characterLevel);
  const classLower = typeof characterClass === 'string' ? characterClass.toLowerCase() : '';
  
  return spells.filter(spell => {
    // Проверка уровня заклинания
    if (spell.level > maxSpellLevel) {
      return false;
    }
    
    // Проверка соответствия классу
    if (spell.classes) {
      if (Array.isArray(spell.classes)) {
        return spell.classes.some(cls => {
          if (typeof cls === 'string') {
            return cls.toLowerCase() === classLower;
          }
          return false;
        });
      } else if (typeof spell.classes === 'string') {
        return spell.classes.toLowerCase() === classLower;
      }
    }
    
    return false;
  });
};
