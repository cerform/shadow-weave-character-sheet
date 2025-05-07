import { Character, CharacterSpell } from '@/types/character';
import { SpellData } from '@/types/spells';

/**
 * Конвертирует CharacterSpell или строку в SpellData
 */
export const convertToSpellData = (spell: CharacterSpell | string): SpellData => {
  if (typeof spell === 'string') {
    return {
      id: spell,
      name: spell,
      level: 0,
      school: '',
      castingTime: '',
      range: '',
      components: '',
      duration: '',
      description: '',
      classes: []
    };
  }
  
  return {
    id: spell.id || spell.name,
    name: spell.name,
    level: spell.level,
    school: spell.school || '',
    castingTime: spell.castingTime || '',
    range: spell.range || '',
    components: spell.components || '',
    duration: spell.duration || '',
    description: spell.description || '',
    classes: spell.classes || [],
    ritual: spell.ritual,
    concentration: spell.concentration
  };
};

/**
 * Получение модификатора характеристики для заклинаний
 */
export const getSpellcastingAbilityModifier = (character: Character): number => {
  if (!character.class) return 0;

  const className = character.class.toLowerCase();
  
  // Определение основной характеристики в зависимости от класса
  let abilityScore = 0;
  
  if (['волшебник', 'artificer'].includes(className)) {
    abilityScore = character.intelligence || character.stats?.intelligence || 10;
  } else if (['жрец', 'друид', 'следопыт'].includes(className)) {
    abilityScore = character.wisdom || character.stats?.wisdom || 10;
  } else if (['бард', 'чародей', 'колдун', 'паладин'].includes(className)) {
    abilityScore = character.charisma || character.stats?.charisma || 10;
  }
  
  return Math.floor((abilityScore - 10) / 2);
};

/**
 * Получение максимального уровня заклинаний для класса и уровня
 */
export const getMaxSpellLevel = (className: string, level: number): number => {
  const fullCasters = ['волшебник', 'жрец', 'друид', 'бард', 'чародей', 'колдун'];
  const halfCasters = ['паладин', 'следопыт'];
  const thirdCasters = ['воин-мистический рыцарь', 'плут-мистический ловкач'];
  
  if (fullCasters.includes(className.toLowerCase())) {
    if (level >= 17) return 9;
    if (level >= 15) return 8;
    if (level >= 13) return 7;
    if (level >= 11) return 6;
    if (level >= 9) return 5;
    if (level >= 7) return 4;
    if (level >= 5) return 3;
    if (level >= 3) return 2;
    return level >= 1 ? 1 : 0;
  } else if (halfCasters.includes(className.toLowerCase())) {
    return Math.ceil(level / 2) > 5 ? 5 : Math.ceil(level / 2);
  } else if (thirdCasters.includes(className.toLowerCase())) {
    return Math.ceil(level / 3);
  }
  
  return 0;
};

/**
 * Фильтрация заклинаний по классу и уровню
 */
export const filterSpellsByClassAndLevel = (spells: SpellData[], className: string, maxLevel: number): SpellData[] => {
  return spells.filter(spell => {
    // Проверка на класс
    const spellClasses = Array.isArray(spell.classes) ? spell.classes : [spell.classes];
    const matchesClass = spellClasses.some(c => c?.toLowerCase() === className?.toLowerCase());
    
    // Проверка на уровень заклинания
    const matchesLevel = spell.level <= maxLevel;
    
    return matchesClass && matchesLevel;
  });
};

/**
 * Вычисление доступных заклинаний по классу и уровню
 */
export const calculateAvailableSpellsByClassAndLevel = (
  className: string,
  level: number,
  abilityModifier: number
): { maxSpellLevel: number; cantripsCount: number; knownSpells: number } => {
  const result = { maxSpellLevel: 0, cantripsCount: 0, knownSpells: 0 };
  
  if (!className) return result;
  
  const normClassName = className.toLowerCase();
  
  // Максимальный уровень заклинаний
  result.maxSpellLevel = getMaxSpellLevel(normClassName, level);
  
  // Количество заговоров
  if (['волшебник', 'друид', 'жрец', 'бард'].includes(normClassName)) {
    result.cantripsCount = level >= 10 ? 5 : (level >= 4 ? 4 : 3);
  } else if (['колдун', 'чародей'].includes(normClassName)) {
    result.cantripsCount = level >= 10 ? 6 : (level >= 4 ? 5 : 4);
  } else if (['следопыт', 'паладин'].includes(normClassName)) {
    result.cantripsCount = 0; // Нет заговоров
  } else {
    result.cantripsCount = 0;
  }
  
  // Количество известных заклинаний
  if (normClassName === 'бард') {
    result.knownSpells = level + abilityModifier;
  } else if (normClassName === 'чародей' || normClassName === 'колдун') {
    result.knownSpells = Math.min(level * 2, 15) + abilityModifier;
  } else if (normClassName === 'жрец' || normClassName === 'друид') {
    result.knownSpells = level + abilityModifier;
  } else if (normClassName === 'волшебник') {
    result.knownSpells = level * 2 + abilityModifier;
  } else if (normClassName === 'паладин' || normClassName === 'следопыт') {
    result.knownSpells = Math.ceil(level / 2) + abilityModifier;
  }
  
  return result;
};

/**
 * Получение названия уровня заклинания
 */
export const getSpellLevelName = (level: number): string => {
  if (level === 0) return 'Заговор';
  return `${level} уровень`;
};

/**
 * Нормализация списка заклинаний
 */
export const normalizeSpells = (spells: (CharacterSpell | string)[] | undefined): SpellData[] => {
  if (!spells || spells.length === 0) return [];
  
  return spells.map(spell => {
    return convertToSpellData(spell);
  });
};
