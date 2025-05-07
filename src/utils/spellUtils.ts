
import { Character, CharacterSpell } from '@/types/character';
import { SpellData } from '@/types/spells';
import { getAllSpells } from '@/data/spells';
import { convertCharacterSpellToSpellData } from '@/types/spells';

// Модификаторы способностей для заклинаний в зависимости от класса
const spellCastingAbilities: Record<string, string> = {
  Бард: 'charisma',
  Жрец: 'wisdom',
  Друид: 'wisdom',
  Волшебник: 'intelligence',
  Колдун: 'charisma',
  Чародей: 'charisma',
  Паладин: 'charisma',
  Следопыт: 'wisdom',
  // Английские названия для совместимости
  Bard: 'charisma',
  Cleric: 'wisdom',
  Druid: 'wisdom',
  Wizard: 'intelligence',
  Warlock: 'charisma',
  Sorcerer: 'charisma',
  Paladin: 'charisma',
  Ranger: 'wisdom'
};

// Лимит на количество заговоров для классов
const cantripLimits: Record<string, Record<number, number>> = {
  Бард: { 1: 2, 4: 3, 10: 4 },
  Жрец: { 1: 3, 4: 4, 10: 5 },
  Друид: { 1: 2, 4: 3, 10: 4 },
  Волшебник: { 1: 3, 4: 4, 10: 5 },
  Колдун: { 1: 2, 4: 3, 10: 4 },
  Чародей: { 1: 4, 4: 5, 10: 6 },
  Паладин: { 1: 0 },
  Следопыт: { 1: 0, 2: 2, 10: 3 },
  // Английские названия для совместимости
  Bard: { 1: 2, 4: 3, 10: 4 },
  Cleric: { 1: 3, 4: 4, 10: 5 },
  Druid: { 1: 2, 4: 3, 10: 4 },
  Wizard: { 1: 3, 4: 4, 10: 5 },
  Warlock: { 1: 2, 4: 3, 10: 4 },
  Sorcerer: { 1: 4, 4: 5, 10: 6 },
  Paladin: { 1: 0 },
  Ranger: { 1: 0, 2: 2, 10: 3 }
};

// Лимит на количество известных заклинаний
const knownSpellsLimits: Record<string, Record<number, number>> = {
  Бард: { 1: 4, 2: 5, 3: 6, 4: 7, 5: 8, 6: 9, 7: 10, 8: 11, 9: 12, 10: 14, 11: 15, 12: 15, 13: 16, 14: 18, 15: 19, 16: 19, 17: 20, 18: 22, 19: 22, 20: 22 },
  Колдун: { 1: 2, 2: 3, 3: 4, 4: 5, 5: 6, 6: 7, 7: 8, 8: 9, 9: 10, 10: 10, 11: 11, 12: 11, 13: 12, 14: 12, 15: 13, 16: 13, 17: 14, 18: 14, 19: 15, 20: 15 },
  Чародей: { 1: 2, 2: 3, 3: 4, 4: 5, 5: 6, 6: 7, 7: 8, 8: 9, 9: 10, 10: 11, 11: 12, 12: 12, 13: 13, 14: 13, 15: 14, 16: 14, 17: 15, 18: 15, 19: 15, 20: 15 },
  Следопыт: { 1: 0, 2: 2, 3: 3, 4: 3, 5: 4, 6: 4, 7: 5, 8: 5, 9: 6, 10: 6, 11: 7, 12: 7, 13: 8, 14: 8, 15: 9, 16: 9, 17: 10, 18: 10, 19: 11, 20: 11 },
  Паладин: { 1: 0, 2: 2, 3: 3, 4: 3, 5: 4, 6: 4, 7: 5, 8: 5, 9: 6, 10: 6, 11: 7, 12: 7, 13: 8, 14: 8, 15: 9, 16: 9, 17: 10, 18: 10, 19: 11, 20: 11 },
  // Английские названия для совместимости
  Bard: { 1: 4, 2: 5, 3: 6, 4: 7, 5: 8, 6: 9, 7: 10, 8: 11, 9: 12, 10: 14, 11: 15, 12: 15, 13: 16, 14: 18, 15: 19, 16: 19, 17: 20, 18: 22, 19: 22, 20: 22 },
  Warlock: { 1: 2, 2: 3, 3: 4, 4: 5, 5: 6, 6: 7, 7: 8, 8: 9, 9: 10, 10: 10, 11: 11, 12: 11, 13: 12, 14: 12, 15: 13, 16: 13, 17: 14, 18: 14, 19: 15, 20: 15 },
  Sorcerer: { 1: 2, 2: 3, 3: 4, 4: 5, 5: 6, 6: 7, 7: 8, 8: 9, 9: 10, 10: 11, 11: 12, 12: 12, 13: 13, 14: 13, 15: 14, 16: 14, 17: 15, 18: 15, 19: 15, 20: 15 },
  Ranger: { 1: 0, 2: 2, 3: 3, 4: 3, 5: 4, 6: 4, 7: 5, 8: 5, 9: 6, 10: 6, 11: 7, 12: 7, 13: 8, 14: 8, 15: 9, 16: 9, 17: 10, 18: 10, 19: 11, 20: 11 },
  Paladin: { 1: 0, 2: 2, 3: 3, 4: 3, 5: 4, 6: 4, 7: 5, 8: 5, 9: 6, 10: 6, 11: 7, 12: 7, 13: 8, 14: 8, 15: 9, 16: 9, 17: 10, 18: 10, 19: 11, 20: 11 }
};

// Получение модификатора способности для заклинаний
export const getSpellcastingAbilityModifier = (character: Character): number => {
  if (!character.class) return 0;
  
  // Определяем нужную способность для класса персонажа
  const charClass = character.class.toLowerCase();
  let abilityKey = '';
  
  // Поиск по ключам в spellCastingAbilities
  for (const key in spellCastingAbilities) {
    if (charClass.includes(key.toLowerCase())) {
      abilityKey = spellCastingAbilities[key];
      break;
    }
  }
  
  // Если не нашли подходящую способность
  if (!abilityKey) return 0;
  
  // Получаем значение модификатора способности
  let abilityScore = 0;
  
  // Проверяем abilities в различных форматах
  if (character.abilities) {
    // Приводим ключ к нужному формату для разных структур abilities
    const shortKey = abilityKey.substring(0, 3).toUpperCase();
    
    if (character.abilities[abilityKey]) {
      abilityScore = character.abilities[abilityKey];
    } else if (character.abilities[shortKey]) {
      abilityScore = character.abilities[shortKey];
    }
  } else if (character[abilityKey as keyof Character]) {
    const value = character[abilityKey as keyof Character];
    if (typeof value === 'number') {
      abilityScore = value;
    }
  }
  
  // Вычисляем модификатор
  return Math.floor((abilityScore - 10) / 2);
};

// Получение максимального уровня заклинаний для класса и уровня
export const getMaxSpellLevel = (className: string | undefined, level: number = 1): number => {
  if (!className) return 0;
  
  // Максимальный уровень заклинаний для каждого класса и уровня персонажа
  const spellLevelsByClass: Record<string, Record<number, number>> = {
    Бард: { 1: 1, 3: 2, 5: 3, 7: 4, 9: 5, 11: 6, 13: 7, 15: 8, 17: 9 },
    Жрец: { 1: 1, 3: 2, 5: 3, 7: 4, 9: 5, 11: 6, 13: 7, 15: 8, 17: 9 },
    Друид: { 1: 1, 3: 2, 5: 3, 7: 4, 9: 5, 11: 6, 13: 7, 15: 8, 17: 9 },
    Волшебник: { 1: 1, 3: 2, 5: 3, 7: 4, 9: 5, 11: 6, 13: 7, 15: 8, 17: 9 },
    Колдун: { 1: 1, 3: 2, 5: 3, 7: 4, 9: 5 },
    Чародей: { 1: 1, 3: 2, 5: 3, 7: 4, 9: 5, 11: 6, 13: 7, 15: 8, 17: 9 },
    Паладин: { 1: 0, 2: 1, 5: 2, 9: 3, 13: 4, 17: 5 },
    Следопыт: { 1: 0, 2: 1, 5: 2, 9: 3, 13: 4, 17: 5 },
    // Английские названия для совместимости
    Bard: { 1: 1, 3: 2, 5: 3, 7: 4, 9: 5, 11: 6, 13: 7, 15: 8, 17: 9 },
    Cleric: { 1: 1, 3: 2, 5: 3, 7: 4, 9: 5, 11: 6, 13: 7, 15: 8, 17: 9 },
    Druid: { 1: 1, 3: 2, 5: 3, 7: 4, 9: 5, 11: 6, 13: 7, 15: 8, 17: 9 },
    Wizard: { 1: 1, 3: 2, 5: 3, 7: 4, 9: 5, 11: 6, 13: 7, 15: 8, 17: 9 },
    Warlock: { 1: 1, 3: 2, 5: 3, 7: 4, 9: 5 },
    Sorcerer: { 1: 1, 3: 2, 5: 3, 7: 4, 9: 5, 11: 6, 13: 7, 15: 8, 17: 9 },
    Paladin: { 1: 0, 2: 1, 5: 2, 9: 3, 13: 4, 17: 5 },
    Ranger: { 1: 0, 2: 1, 5: 2, 9: 3, 13: 4, 17: 5 }
  };
  
  let maxLevel = 0;
  
  // Находим класс по частичному совпадению
  for (const key in spellLevelsByClass) {
    if (className.toLowerCase().includes(key.toLowerCase())) {
      const levelMapping = spellLevelsByClass[key];
      
      // Находим наибольший уровень заклинаний для текущего уровня персонажа
      for (let i = level; i >= 1; i--) {
        if (levelMapping[i] !== undefined) {
          maxLevel = levelMapping[i];
          break;
        }
      }
      break;
    }
  }
  
  return maxLevel;
};

// Функция для расчета доступных заклинаний на основе класса и уровня персонажа
export const calculateAvailableSpellsByClassAndLevel = (
  className: string | undefined,
  level: number = 1,
  abilityModifier: number = 0
): { maxSpellLevel: number; cantripsCount: number; knownSpells: number; preparedSpellsLimit?: number } => {
  if (!className) {
    return {
      maxSpellLevel: 0,
      cantripsCount: 0,
      knownSpells: 0
    };
  }
  
  // Максимальный уровень заклинаний
  const maxSpellLevel = getMaxSpellLevel(className, level);
  
  // Количество заговоров
  let cantripsCount = 0;
  // Находим класс по частичному совпадению
  for (const key in cantripLimits) {
    if (className.toLowerCase().includes(key.toLowerCase())) {
      const limits = cantripLimits[key];
      // Находим подходящий уровень для заговоров
      for (let i = level; i >= 1; i--) {
        if (limits[i] !== undefined) {
          cantripsCount = limits[i];
          break;
        }
      }
      break;
    }
  }
  
  // Количество известных заклинаний
  let knownSpells = 0;
  let isPreparedCaster = false;
  
  // Проверяем, является ли класс "подготавливающим" заклинания
  const preparedCasters = ['Жрец', 'Друид', 'Волшебник', 'Паладин', 'Cleric', 'Druid', 'Wizard', 'Paladin'];
  for (const caster of preparedCasters) {
    if (className.toLowerCase().includes(caster.toLowerCase())) {
      isPreparedCaster = true;
      break;
    }
  }
  
  if (isPreparedCaster) {
    // Для классов, которые подготавливают заклинания (Жрец, Друид, Волшебник, Паладин)
    const preparedSpellsLimit = abilityModifier + level;
    return {
      maxSpellLevel,
      cantripsCount,
      knownSpells: 0, // У этих классов нет фиксированного количества известных заклинаний
      preparedSpellsLimit: preparedSpellsLimit > 1 ? preparedSpellsLimit : 1 // Минимум 1 заклинание
    };
  } else {
    // Для классов с фиксированным количеством известных заклинаний (Бард, Колдун, Чародей, Следопыт)
    for (const key in knownSpellsLimits) {
      if (className.toLowerCase().includes(key.toLowerCase())) {
        const limits = knownSpellsLimits[key];
        for (let i = level; i >= 1; i--) {
          if (limits[i] !== undefined) {
            knownSpells = limits[i];
            break;
          }
        }
        break;
      }
    }
    
    return {
      maxSpellLevel,
      cantripsCount,
      knownSpells
    };
  }
};

// Фильтрация заклинаний по классу и уровню
export const filterSpellsByClassAndLevel = (
  spells: SpellData[] | CharacterSpell[],
  className: string | undefined,
  maxLevel?: number
): SpellData[] => {
  if (!className || !spells.length) return [];
  
  // Определяем максимальный уровень заклинаний, если не указан явно
  const effectiveMaxLevel = maxLevel !== undefined ? maxLevel : getMaxSpellLevel(className);
  
  // Фильтруем по классу и уровню
  return spells
    .filter(spell => {
      // Проверка на соответствие класса
      let isMatchingClass = false;
      if (typeof spell.classes === 'string') {
        isMatchingClass = spell.classes.toLowerCase().includes(className.toLowerCase());
      } else if (Array.isArray(spell.classes)) {
        isMatchingClass = spell.classes.some(c => 
          typeof c === 'string' && c.toLowerCase().includes(className.toLowerCase())
        );
      }
      
      // Проверка на уровень заклинания
      const isValidLevel = spell.level <= effectiveMaxLevel;
      
      return isMatchingClass && isValidLevel;
    })
    .map(spell => {
      // Убеждаемся, что результат соответствует SpellData
      if ('id' in spell && typeof spell.id !== 'undefined') {
        return spell as SpellData;
      } else {
        return convertCharacterSpellToSpellData(spell as CharacterSpell);
      }
    });
};

// Преобразование любых типов заклинаний в SpellData
export const convertToSpellData = (spell: string | CharacterSpell | SpellData): SpellData => {
  // Если заклинание уже в формате SpellData
  if (typeof spell !== 'string' && 'id' in spell && spell.id !== undefined) {
    return spell as SpellData;
  }
  
  // Если заклинание в формате CharacterSpell
  if (typeof spell !== 'string' && 'name' in spell) {
    return convertCharacterSpellToSpellData(spell as CharacterSpell);
  }
  
  // Если заклинание - строка (id или имя)
  const spellName = typeof spell === 'string' ? spell : '';
  
  // Попытаемся найти заклинание в базе данных заклинаний
  const allSpells = getAllSpells();
  const foundSpell = allSpells.find(s => 
    s.id === spellName || s.name === spellName
  );
  
  if (foundSpell) {
    return foundSpell;
  }
  
  // Если заклинание не найдено, создаем минимальный объект SpellData
  return {
    id: typeof spell === 'string' ? spell : `unknown-spell-${Date.now()}`,
    name: typeof spell === 'string' ? spell : 'Неизвестное заклинание',
    level: 0,
    school: 'Универсальная',
    castingTime: '1 действие',
    range: 'Касание',
    components: 'В',
    duration: 'Мгновенная',
    description: 'Нет описания',
    classes: []
  };
};

// Функция для нормализации массива заклинаний
export const normalizeSpells = (spells: (string | CharacterSpell | SpellData)[]): SpellData[] => {
  return spells.map(spell => convertToSpellData(spell));
};

// Проверка валидности заклинания для персонажа
export const isSpellValidForCharacter = (
  spell: SpellData | CharacterSpell,
  character: Character
): boolean => {
  if (!character.class) return false;
  
  const spellLevel = spell.level;
  const maxLevel = getMaxSpellLevel(character.class, character.level || 1);
  
  // Проверка уровня заклинания
  if (spellLevel > maxLevel) return false;
  
  // Проверка класса
  let isClassValid = false;
  if (typeof spell.classes === 'string') {
    isClassValid = spell.classes.toLowerCase().includes(character.class.toLowerCase());
  } else if (Array.isArray(spell.classes)) {
    isClassValid = spell.classes.some(c => 
      typeof c === 'string' && c.toLowerCase().includes(character.class?.toLowerCase() || '')
    );
  }
  
  return isClassValid;
};

// Получение количества доступных ячеек заклинаний для каждого уровня
export const getAvailableSpellSlots = (
  className: string | undefined,
  level: number = 1
): Record<number, { max: number; used: number }> => {
  if (!className) return {};
  
  // Определяем максимальные ячейки заклинаний для класса и уровня
  const spellSlotsByClass: Record<string, Record<number, Record<number, number>>> = {
    // Ключ класса -> уровень персонажа -> { уровень ячейки: количество }
    Бард: {
      1: { 1: 2 },
      2: { 1: 3 },
      3: { 1: 4, 2: 2 },
      4: { 1: 4, 2: 3 },
      5: { 1: 4, 2: 3, 3: 2 },
      6: { 1: 4, 2: 3, 3: 3 },
      7: { 1: 4, 2: 3, 3: 3, 4: 1 },
      8: { 1: 4, 2: 3, 3: 3, 4: 2 },
      9: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 1 },
      10: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2 },
      11: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1 },
      12: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1 },
      13: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1 },
      14: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1 },
      15: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1, 8: 1 },
      16: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1, 8: 1 },
      17: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1, 8: 1, 9: 1 },
      18: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 3, 6: 1, 7: 1, 8: 1, 9: 1 },
      19: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 3, 6: 2, 7: 1, 8: 1, 9: 1 },
      20: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 3, 6: 2, 7: 2, 8: 1, 9: 1 }
    },
    // И так для всех остальных классов...
  };
  
  let slots: Record<number, { max: number; used: number }> = {};
  
  // Находим соответствующий класс
  for (const key in spellSlotsByClass) {
    if (className.toLowerCase().includes(key.toLowerCase())) {
      const levelSlots = spellSlotsByClass[key][Math.min(level, 20)] || {};
      
      // Заполняем слоты
      for (const slotLevel in levelSlots) {
        slots[parseInt(slotLevel)] = {
          max: levelSlots[parseInt(slotLevel)],
          used: 0
        };
      }
      break;
    }
  }
  
  return slots;
};
