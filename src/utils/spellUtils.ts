
import { Character, CharacterSpell } from '@/types/character';
import { SpellData, convertCharacterSpellToSpellData } from '@/types/spells';

/**
 * Преобразует заклинания для сохранения в состоянии
 */
export const convertSpellsForState = (spells: (CharacterSpell | string)[]): CharacterSpell[] => {
  return spells.map(spell => {
    if (typeof spell === 'string') {
      return {
        name: spell,
        level: 0,
        prepared: true,
        ritual: false,
        concentration: false,
        school: 'Универсальная',
        castingTime: '1 действие',
        range: 'На себя',
        components: '',
        duration: 'Мгновенная',
        description: 'Нет описания',
        classes: [] as string[] 
      };
    }
    return spell;
  });
};

/**
 * Получает максимальный уровень заклинаний для класса и уровня персонажа
 */
export const getMaxSpellLevel = (characterClass: string, level: number): number => {
  const classLower = characterClass.toLowerCase();
  
  // Полные заклинатели
  if (['волшебник', 'wizard', 'жрец', 'cleric', 'друид', 'druid', 'бард', 'bard', 'чародей', 'sorcerer'].includes(classLower)) {
    if (level >= 17) return 9;
    if (level >= 15) return 8;
    if (level >= 13) return 7;
    if (level >= 11) return 6;
    if (level >= 9) return 5;
    if (level >= 7) return 4;
    if (level >= 5) return 3;
    if (level >= 3) return 2;
    if (level >= 1) return 1;
    return 0;
  }
  
  // Полузаклинатели (паладин, следопыт)
  if (['паладин', 'paladin', 'следопыт', 'ranger'].includes(classLower)) {
    if (level >= 17) return 5;
    if (level >= 13) return 4;
    if (level >= 9) return 3;
    if (level >= 5) return 2;
    if (level >= 2) return 1;
    return 0;
  }
  
  // Колдун (особая система)
  if (['колдун', 'warlock'].includes(classLower)) {
    if (level >= 9) return 5;
    if (level >= 7) return 4;
    if (level >= 5) return 3;
    if (level >= 3) return 2;
    if (level >= 1) return 1;
    return 0;
  }
  
  return 0; // Для неизвестных классов или тех, у кого нет заклинаний
};

/**
 * Рассчитывает количество известных заговоров для класса и уровня
 */
const getKnownCantrips = (characterClass: string, level: number): number => {
  const classLower = characterClass.toLowerCase();
  
  if (['волшебник', 'wizard'].includes(classLower)) {
    if (level >= 10) return 5;
    if (level >= 4) return 4;
    if (level >= 1) return 3;
  }
  
  if (['друид', 'druid', 'жрец', 'cleric'].includes(classLower)) {
    if (level >= 10) return 5;
    if (level >= 4) return 4;
    if (level >= 1) return 3;
  }
  
  if (['бард', 'bard'].includes(classLower)) {
    if (level >= 10) return 4;
    if (level >= 4) return 3;
    if (level >= 1) return 2;
  }
  
  if (['чародей', 'sorcerer'].includes(classLower)) {
    if (level >= 10) return 6;
    if (level >= 4) return 5;
    if (level >= 1) return 4;
  }
  
  if (['колдун', 'warlock'].includes(classLower)) {
    if (level >= 10) return 4;
    if (level >= 4) return 3;
    if (level >= 1) return 2;
  }
  
  if (['следопыт', 'ranger'].includes(classLower) && level >= 2) {
    return 2; // Следопыты получают 2 заговора начиная со 2-го уровня (по Tasha's)
  }
  
  return 0; // По умолчанию
};

/**
 * Рассчитывает количество известных заклинаний для класса и уровня
 */
const getKnownSpells = (characterClass: string, level: number, abilityModifier: number = 0): number => {
  const classLower = characterClass.toLowerCase();
  
  // Жрец, Друид, Паладин, Следопыт готовят заклинания в зависимости от модификатора способности
  if (['жрец', 'cleric', 'друид', 'druid'].includes(classLower)) {
    return level + abilityModifier; // Уровень класса + модификатор мудрости
  }
  
  if (['паладин', 'paladin'].includes(classLower) && level >= 2) {
    return Math.floor(level / 2) + abilityModifier; // Половина уровня + модификатор харизмы
  }
  
  if (['следопыт', 'ranger'].includes(classLower) && level >= 2) {
    return Math.floor(level / 2) + abilityModifier; // Половина уровня + модификатор мудрости
  }
  
  // Волшебники учат заклинания через книгу, но начинают с 6 + 2 за уровень
  if (['волшебник', 'wizard'].includes(classLower)) {
    return 6 + ((level - 1) * 2); // Начинают с 6, +2 за каждый уровень выше 1
  }
  
  // Известные заклинания для классов с фиксированным количеством
  if (['бард', 'bard'].includes(classLower)) {
    const knownByLevel = [4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15, 15, 16, 18, 19, 19, 20, 22, 22, 22];
    return knownByLevel[level - 1] || 4;
  }
  
  if (['чародей', 'sorcerer'].includes(classLower)) {
    const knownByLevel = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 12, 13, 13, 14, 14, 15, 15, 15, 15];
    return knownByLevel[level - 1] || 2;
  }
  
  if (['колдун', 'warlock'].includes(classLower)) {
    const knownByLevel = [2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 11, 11, 12, 12, 13, 13, 14, 14, 15, 15];
    return knownByLevel[level - 1] || 2;
  }
  
  return 0; // По умолчанию
};

/**
 * Вычисляет доступные заклинания для класса и уровня персонажа
 */
export const calculateAvailableSpellsByClassAndLevel = (
  characterClass: string, 
  level: number,
  abilityModifier: number = 0
): {
  maxSpellLevel: number;
  cantripsCount: number;
  knownSpells: number;
} => {
  const maxLevel = getMaxSpellLevel(characterClass, level);
  const cantrips = getKnownCantrips(characterClass, level);
  const knownSpells = getKnownSpells(characterClass, level, abilityModifier);
  
  return {
    maxSpellLevel: maxLevel,
    cantripsCount: cantrips,
    knownSpells: knownSpells
  };
};

/**
 * Получает модификатор базовой характеристики для заклинаний в зависимости от класса
 */
export const getSpellcastingAbilityModifier = (character: Character): number => {
  if (!character.class) return 0;
  
  const classLower = character.class.toLowerCase();
  
  if (['жрец', 'cleric', 'друид', 'druid'].includes(classLower)) {
    // Мудрость
    return Math.floor((character.wisdom || 10) - 10) / 2;
  } 
  else if (['волшебник', 'wizard'].includes(classLower)) {
    // Интеллект
    return Math.floor((character.intelligence || 10) - 10) / 2;
  } 
  else {
    // Харизма (бард, колдун, чародей, паладин)
    return Math.floor((character.charisma || 10) - 10) / 2;
  }
};

/**
 * Проверяет соответствие заклинания классу персонажа
 */
export const isSpellAvailableForClass = (spell: SpellData, characterClass: string): boolean => {
  if (!characterClass || !spell.classes) return false;
  
  const characterClassLower = characterClass.toLowerCase();
  
  let spellClasses: string[] = [];
  if (typeof spell.classes === 'string') {
    spellClasses = [spell.classes.toLowerCase()];
  } else if (Array.isArray(spell.classes)) {
    spellClasses = spell.classes.map(c => typeof c === 'string' ? c.toLowerCase() : '');
  }
  
  // Проверяем соответствие класса
  return spellClasses.some(cls => 
    cls === characterClassLower ||
    (characterClassLower === 'жрец' && cls === 'cleric') ||
    (characterClassLower === 'волшебник' && cls === 'wizard') ||
    (characterClassLower === 'друид' && cls === 'druid') ||
    (characterClassLower === 'бард' && cls === 'bard') ||
    (characterClassLower === 'колдун' && cls === 'warlock') ||
    (characterClassLower === 'чародей' && cls === 'sorcerer') ||
    (characterClassLower === 'паладин' && cls === 'paladin') ||
    (characterClassLower === 'следопыт' && cls === 'ranger')
  );
};

/**
 * Фильтрует заклинания по классу и уровню персонажа
 */
export const filterSpellsByClassAndLevel = (
  spells: SpellData[],
  characterClass: string,
  level: number
): SpellData[] => {
  if (!characterClass || !spells || !spells.length) return [];
  
  const maxSpellLevel = getMaxSpellLevel(characterClass, level);
  
  return spells.filter(spell => {
    // Проверяем доступность заклинания по уровню
    const isLevelAvailable = spell.level <= maxSpellLevel;
    
    // Проверяем доступность заклинания по классу
    const isClassAvailable = isSpellAvailableForClass(spell, characterClass);
    
    return isLevelAvailable && isClassAvailable;
  });
};

/**
 * Возвращает количество ячеек заклинаний для класса и уровня
 */
export const getSpellSlotsByLevel = (characterClass: string, level: number): Record<number, { max: number; used: number }> => {
  const slots: Record<number, { max: number; used: number }> = {};
  
  const lowerClass = (characterClass || '').toLowerCase();
  
  // Полные заклинатели (маг, жрец, друид, бард)
  if (['волшебник', 'wizard', 'жрец', 'cleric', 'друид', 'druid', 'бард', 'bard', 'чародей', 'sorcerer'].includes(lowerClass)) {
    if (level >= 1) {
      slots[1] = { max: level >= 3 ? 4 : level >= 2 ? 3 : 2, used: 0 };
    }
    if (level >= 3) {
      slots[2] = { max: level >= 4 ? 3 : 2, used: 0 };
    }
    if (level >= 5) {
      slots[3] = { max: level >= 6 ? 3 : 2, used: 0 };
    }
    if (level >= 7) {
      slots[4] = { max: level >= 8 ? 3 : 1, used: 0 };
    }
    if (level >= 9) {
      slots[5] = { max: level >= 10 ? 2 : 1, used: 0 };
    }
    if (level >= 11) {
      slots[6] = { max: 1, used: 0 };
    }
    if (level >= 13) {
      slots[7] = { max: 1, used: 0 };
    }
    if (level >= 15) {
      slots[8] = { max: 1, used: 0 };
    }
    if (level >= 17) {
      slots[9] = { max: 1, used: 0 };
    }
  }
  // Полузаклинатели (паладин, следопыт)
  else if (['паладин', 'paladin', 'следопыт', 'ranger'].includes(lowerClass)) {
    if (level >= 2) {
      slots[1] = { max: level >= 3 ? 3 : 2, used: 0 };
    }
    if (level >= 5) {
      slots[2] = { max: level >= 7 ? 3 : 2, used: 0 };
    }
    if (level >= 9) {
      slots[3] = { max: level >= 11 ? 3 : 2, used: 0 };
    }
    if (level >= 13) {
      slots[4] = { max: level >= 15 ? 2 : 1, used: 0 };
    }
    if (level >= 17) {
      slots[5] = { max: 1, used: 0 };
    }
  }
  // Колдун (особая система ячеек)
  else if (['колдун', 'warlock'].includes(lowerClass)) {
    const maxSlotLevel = Math.min(5, Math.ceil(level / 2));
    const slotsCount = level === 1 ? 1 : (level < 11 ? 2 : (level < 17 ? 3 : 4));
    
    if (level >= 1) {
      slots[maxSlotLevel] = { max: slotsCount, used: 0 };
    }
  }
  
  return slots;
};

/**
 * Проверяет, может ли персонаж подготовить ещё заклинания
 */
export const canPrepareMoreSpells = (character: Character): boolean => {
  const preparedSpellsLimit = getPreparedSpellsLimit(character);
  if (preparedSpellsLimit <= 0) return true; // Нет ограничения на подготовку
  
  // Считаем уже подготовленные заклинания
  const preparedSpellsCount = (character.spells || []).filter(spell => {
    if (typeof spell === 'string') return false;
    return spell.prepared && spell.level > 0; // Заговоры не учитываются
  }).length;
  
  return preparedSpellsCount < preparedSpellsLimit;
};

/**
 * Получает максимальное количество подготовленных заклинаний
 */
export const getPreparedSpellsLimit = (character: Character): number => {
  if (!character.class) return 0;
  
  const classLower = character.class.toLowerCase();
  
  // Для классов, которые готовят заклинания
  if (['жрец', 'cleric', 'друид', 'druid', 'волшебник', 'wizard'].includes(classLower)) {
    // Уровень класса + модификатор базовой характеристики
    return character.level + getSpellcastingAbilityModifier(character);
  }
  
  if (['паладин', 'paladin', 'следопыт', 'ranger'].includes(classLower) && character.level >= 2) {
    // Половина уровня (округлённая вниз) + модификатор базовой характеристики
    return Math.floor(character.level / 2) + getSpellcastingAbilityModifier(character);
  }
  
  // Колдун, Чародей и Бард не готовят заклинания, а просто знают определённое количество
  return 0;
};

/**
 * Преобразует заклинания персонажа в формат SpellData для использования в компонентах
 */
export const convertCharacterSpellsToSpellsData = (character: Character): SpellData[] => {
  if (!character.spells || !character.spells.length) return [];
  
  return character.spells.map(spell => {
    if (typeof spell === 'string') {
      // Минимальная информация о заклинании, если оно представлено строкой
      return {
        id: `spell-${spell.replace(/\s+/g, '-').toLowerCase()}`,
        name: spell,
        level: 0,
        school: 'Универсальная',
        castingTime: '1 действие',
        range: 'На себя',
        components: '',
        duration: 'Мгновенная',
        description: ['Нет описания'],
        classes: character.class || [],
        ritual: false,
        concentration: false,
        prepared: true
      } as SpellData;
    }
    
    // Полное преобразование объекта заклинания
    return convertCharacterSpellToSpellData(spell);
  });
};
