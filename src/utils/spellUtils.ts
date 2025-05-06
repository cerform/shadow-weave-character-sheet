
import { Character, CharacterSpell } from "@/types/character";
import { SpellData } from "@/types/spells";

/**
 * Вычисляет доступные заклинания по классу и уровню
 */
export const calculateAvailableSpellsByClassAndLevel = (
  characterClass: string,
  level: number,
  abilityModifier: number = 0
) => {
  // Если класс не задан или уровень меньше 1, возвращаем пустые значения
  if (!characterClass || level < 1) {
    return {
      knownSpells: 0,
      cantripsCount: 0,
      maxSpellLevel: 0
    };
  }

  const lowerClass = characterClass.toLowerCase();
  
  // Вычисляем максимальный уровень заклинаний
  const maxSpellLevel = getMaxSpellLevel(characterClass, level);
  
  // Вычисляем количество известных заговоров
  let cantripsCount = 0;
  if (['бард', 'чародей', 'колдун', 'wizard', 'волшебник'].includes(lowerClass)) {
    if (level < 4) cantripsCount = 2;
    else if (level < 10) cantripsCount = 3;
    else cantripsCount = 4;
  } else if (['cleric', 'жрец', 'друид', 'druid'].includes(lowerClass)) {
    if (level < 4) cantripsCount = 3;
    else if (level < 10) cantripsCount = 4;
    else cantripsCount = 5;
  } else if (['artificer', 'артефайсер'].includes(lowerClass)) {
    if (level < 10) cantripsCount = 2;
    else cantripsCount = 3;
  } else if (['следопыт', 'ranger'].includes(lowerClass)) {
    cantripsCount = 0; // Rangers don't get cantrips in base 5e
  } else if (['паладин', 'paladin'].includes(lowerClass)) {
    cantripsCount = 0; // Paladins don't get cantrips in base 5e
  }
  
  // Вычисляем количество известных заклинаний
  let knownSpells = 0;
  if (['чародей', 'sorcerer'].includes(lowerClass)) {
    // Чародей: Level + 1 известных заклинаний
    knownSpells = level + 1;
  } else if (['бард', 'bard'].includes(lowerClass)) {
    // Бард: формула (level + Char mod)
    knownSpells = Math.max(1, Math.floor(level / 2) + 4);
  } else if (['колдун', 'warlock'].includes(lowerClass)) {
    // Колдун: (level + 1) известных заклинаний
    knownSpells = level + 1;
  } else if (['жрец', 'cleric', 'друид', 'druid'].includes(lowerClass)) {
    // Жрец/Друид: уровень + модификатор способности
    knownSpells = level + abilityModifier;
  } else if (['wizard', 'волшебник'].includes(lowerClass)) {
    // Волшебник: 6 + 2 за каждый уровень
    knownSpells = 6 + (level - 1) * 2;
  } else if (['следопыт', 'ranger'].includes(lowerClass)) {
    // Следопыт: начиная с 2 уровня
    if (level >= 2) {
      knownSpells = Math.ceil(level / 2) + 1;
    }
  } else if (['паладин', 'paladin'].includes(lowerClass)) {
    // Паладин: начиная с 2 уровня, половина уровня + модификатор
    if (level >= 2) {
      knownSpells = Math.floor(level / 2) + abilityModifier;
    }
  }
  
  return {
    knownSpells: Math.max(0, knownSpells),
    cantripsCount: Math.max(0, cantripsCount),
    maxSpellLevel
  };
};

/**
 * Возвращает максимальный уровень заклинаний для класса и уровня
 */
export const getMaxSpellLevel = (characterClass: string, level: number): number => {
  if (!characterClass || level < 1) return 0;
  
  const lowerClass = characterClass.toLowerCase();
  
  // Полные заклинатели (Жрец, Друид, Волшебник, Бард, Чародей)
  if (['жрец', 'cleric', 'друид', 'druid', 'wizard', 'волшебник', 'бард', 'bard', 'чародей', 'sorcerer'].includes(lowerClass)) {
    if (level < 3) return 1;
    else if (level < 5) return 2;
    else if (level < 7) return 3;
    else if (level < 9) return 4;
    else if (level < 11) return 5;
    else if (level < 13) return 6;
    else if (level < 15) return 7;
    else if (level < 17) return 8;
    else return 9;
  }
  
  // Полу-заклинатели (Паладин, Следопыт)
  if (['паладин', 'paladin', 'следопыт', 'ranger'].includes(lowerClass)) {
    if (level < 5) return 1;
    else if (level < 9) return 2;
    else if (level < 13) return 3;
    else if (level < 17) return 4;
    else return 5;
  }
  
  // Особый случай - Колдун
  if (['колдун', 'warlock'].includes(lowerClass)) {
    if (level < 3) return 1;
    else if (level < 5) return 2;
    else if (level < 7) return 3;
    else if (level < 9) return 4;
    else return 5;
  }
  
  return 0; // Для не-магических классов
};

/**
 * Фильтрует заклинания по классу и уровню
 */
export const filterSpellsByClassAndLevel = (
  spells: SpellData[],
  characterClass: string,
  characterLevel: number
): SpellData[] => {
  if (!spells || !characterClass) return [];
  
  const maxLevel = getMaxSpellLevel(characterClass, characterLevel);
  const classLower = characterClass.toLowerCase();
  
  return spells.filter(spell => {
    // Проверяем уровень заклинания
    if (spell.level > maxLevel) return false;
    
    // Проверяем, принадлежит ли заклинание классу
    let isClassSpell = false;
    
    if (typeof spell.classes === 'string') {
      // Обрабатываем случай, когда classes - это строка
      isClassSpell = spell.classes.toLowerCase().includes(classLower) || 
                      (classLower === 'жрец' && spell.classes.toLowerCase().includes('cleric')) ||
                      (classLower === 'волшебник' && spell.classes.toLowerCase().includes('wizard')) ||
                      (classLower === 'друид' && spell.classes.toLowerCase().includes('druid')) ||
                      (classLower === 'бард' && spell.classes.toLowerCase().includes('bard')) ||
                      (classLower === 'паладин' && spell.classes.toLowerCase().includes('paladin')) ||
                      (classLower === 'следопыт' && spell.classes.toLowerCase().includes('ranger')) ||
                      (classLower === 'чародей' && spell.classes.toLowerCase().includes('sorcerer')) ||
                      (classLower === 'колдун' && spell.classes.toLowerCase().includes('warlock'));
    } else if (Array.isArray(spell.classes)) {
      // Обрабатываем случай, когда classes - это массив
      isClassSpell = spell.classes.some(cls => {
        if (typeof cls !== 'string') return false;
        
        const clsLower = cls.toLowerCase();
        return clsLower.includes(classLower) ||
              (classLower === 'жрец' && clsLower.includes('cleric')) ||
              (classLower === 'волшебник' && clsLower.includes('wizard')) ||
              (classLower === 'друид' && clsLower.includes('druid')) ||
              (classLower === 'бард' && clsLower.includes('bard')) ||
              (classLower === 'паладин' && clsLower.includes('paladin')) ||
              (classLower === 'следопыт' && clsLower.includes('ranger')) ||
              (classLower === 'чародей' && clsLower.includes('sorcerer')) ||
              (classLower === 'колдун' && clsLower.includes('warlock'));
      });
    }
    
    return isClassSpell;
  });
};

/**
 * Нормализует массив заклинаний персонажа
 */
export const normalizeSpells = (character: Character): CharacterSpell[] => {
  if (!character.spells) return [];
  
  return character.spells.map(spell => {
    if (typeof spell === 'string') {
      return {
        name: spell,
        level: 0,
        school: 'Универсальная',
        prepared: true
      };
    }
    return spell;
  });
};

/**
 * Преобразует CharacterSpell в SpellData
 */
export const convertToSpellData = (spell: CharacterSpell): SpellData => {
  return {
    id: spell.id || `spell-${spell.name.replace(/\s+/g, '-').toLowerCase()}`,
    name: spell.name,
    level: spell.level,
    school: spell.school || 'Универсальная',
    castingTime: spell.castingTime || '1 действие',
    range: spell.range || 'На себя',
    components: spell.components || '',
    duration: spell.duration || 'Мгновенная',
    description: spell.description || 'Нет описания',
    // Fix: Ensure classes is always an array by explicitly handling all possible cases
    classes: (function() {
      if (!spell.classes) return [] as string[];
      if (typeof spell.classes === 'string') return [spell.classes];
      return spell.classes;
    })(),
    ritual: spell.ritual || false,
    concentration: spell.concentration || false,
    prepared: spell.prepared || false,
    verbal: spell.verbal || false,
    somatic: spell.somatic || false,
    material: spell.material || false
  };
};

/**
 * Получает модификатор способности для заклинаний на основе класса
 */
export const getSpellcastingAbilityModifier = (character: Character): number => {
  if (!character || !character.class) return 0;
  
  const charClass = character.class.toLowerCase();
  let abilityScore = 10; // По умолчанию 10 (модификатор 0)

  // Определяем основную характеристику в зависимости от класса
  if (['жрец', 'друид', 'cleric', 'druid'].includes(charClass)) {
    // Мудрость
    abilityScore = character.wisdom || character.abilities?.WIS || character.abilities?.wisdom || 10;
  } else if (['волшебник', 'wizard', 'artificer', 'артефайсер'].includes(charClass)) {
    // Интеллект
    abilityScore = character.intelligence || character.abilities?.INT || character.abilities?.intelligence || 10;
  } else {
    // Харизма (бард, колдун, чародей, паладин)
    abilityScore = character.charisma || character.abilities?.CHA || character.abilities?.charisma || 10;
  }

  // Вычисляем модификатор
  return Math.floor((abilityScore - 10) / 2);
};

/**
 * Вычисляет лимит подготовленных заклинаний
 */
export const getPreparedSpellsLimit = (character: Character): number => {
  if (!character.class) return 0;
  
  const classLower = character.class.toLowerCase();
  
  // Классы, которые готовят заклинания
  if (['жрец', 'друид', 'волшебник', 'cleric', 'druid', 'wizard'].includes(classLower)) {
    const abilityMod = getSpellcastingAbilityModifier(character);
    return Math.max(1, character.level + abilityMod);
  }
  
  // Классы с известными заклинаниями (не готовят их)
  if (['бард', 'чародей', 'колдун', 'bard', 'sorcerer', 'warlock'].includes(classLower)) {
    return 0; // Не готовят заклинания, а просто знают их
  }
  
  // Паладин и следопыт
  if (['паладин', 'следопыт', 'paladin', 'ranger'].includes(classLower)) {
    const abilityMod = getSpellcastingAbilityModifier(character);
    return Math.max(1, Math.floor(character.level / 2) + abilityMod);
  }
  
  return 0;
};

/**
 * Проверяет, может ли персонаж подготовить ещё заклинания
 */
export const canPrepareMoreSpells = (character: Character): boolean => {
  const limit = getPreparedSpellsLimit(character);
  if (limit <= 0) return true; // Если лимита нет, всегда можно подготовить
  
  const preparedCount = normalizeSpells(character).filter(spell => 
    spell.prepared && spell.level > 0 // Заговоры не считаются
  ).length;
  
  return preparedCount < limit;
};

/**
 * Конвертирует заклинания для хранения в состоянии
 */
export const convertSpellsForState = (spells: SpellData[]): CharacterSpell[] => {
  return spells.map(spell => ({
    id: spell.id.toString(),
    name: spell.name,
    level: spell.level,
    school: spell.school,
    castingTime: spell.castingTime,
    range: spell.range,
    components: spell.components,
    duration: spell.duration,
    description: Array.isArray(spell.description) ? spell.description.join('\n') : spell.description,
    classes: Array.isArray(spell.classes) ? spell.classes.join(', ') : spell.classes,
    prepared: spell.prepared || false,
    ritual: spell.ritual || false,
    concentration: spell.concentration || false
  }));
};
