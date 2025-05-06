
import { SpellData } from "@/types/spells";
import { CharacterSpell, Character } from "@/types/character";

/**
 * Вычисляет максимальный уровень заклинаний, доступный персонажу
 */
export const getMaxSpellLevel = (className: string, level: number): number => {
  // Переводим название класса в нижний регистр для совместимости
  const classNameLower = className.toLowerCase();
  
  // Полные заклинатели
  if (['маг', 'чародей', 'волшебник', 'друид', 'жрец', 'бард'].includes(classNameLower)) {
    if (level >= 17) return 9;
    else if (level >= 15) return 8;
    else if (level >= 13) return 7;
    else if (level >= 11) return 6;
    else if (level >= 9) return 5;
    else if (level >= 7) return 4;
    else if (level >= 5) return 3;
    else if (level >= 3) return 2;
    else if (level >= 1) return 1;
  }
  // Полу-заклинатели
  else if (['паладин', 'следопыт', 'искусственник'].includes(classNameLower)) {
    if (level >= 17) return 5;
    else if (level >= 13) return 4;
    else if (level >= 9) return 3;
    else if (level >= 5) return 2;
    else if (level >= 2) return 1;
  }
  // Частичные заклинатели и особый случай для колдуна
  else if (['колдун'].includes(classNameLower)) {
    if (level >= 17) return 5;
    else if (level >= 11) return 5;
    else if (level >= 9) return 5;
    else if (level >= 7) return 4;
    else if (level >= 5) return 3;
    else if (level >= 3) return 2;
    else if (level >= 1) return 1;
  }
  else if (['воин (мистический рыцарь)', 'плут (мистический ловкач)', 'монах (путь четырех стихий)'].includes(classNameLower)) {
    if (level >= 19) return 4;
    else if (level >= 13) return 3;
    else if (level >= 7) return 2;
    else if (level >= 3) return 1;
  }
  
  return 0;
};

/**
 * Определяет количество известных заклинаний для класса и уровня
 */
export const calculateKnownSpells = (className: string, level: number, modifierBonus: number = 3): { 
  maxLevel: number;
  cantripsCount: number;
  knownSpells: number;
  cantrips: number; // Alias for cantripsCount
  spells: number;   // Alias for knownSpells
  maxSpellLevel: number; // Alias for maxLevel
} => {
  // Переводим название класса в нижний регистр для совместимости
  const classNameLower = className.toLowerCase();
  
  const maxLevel = getMaxSpellLevel(className, level);
  
  const result = {
    maxLevel,
    maxSpellLevel: maxLevel, // Alias
    cantripsCount: 0,
    knownSpells: 0,
    get cantrips() { return this.cantripsCount; },
    get spells() { return this.knownSpells; }
  };

  // Определение количества заговоров
  if (['бард'].includes(classNameLower)) {
    if (level >= 10) result.cantripsCount = 4;
    else if (level >= 4) result.cantripsCount = 3;
    else result.cantripsCount = 2;
  } else if (['друид', 'жрец', 'чародей', 'маг', 'волшебник'].includes(classNameLower)) {
    if (level >= 10) result.cantripsCount = 5;
    else if (level >= 4) result.cantripsCount = 4;
    else result.cantripsCount = 3;
  } else if (['колдун'].includes(classNameLower)) {
    if (level >= 10) result.cantripsCount = 4;
    else if (level >= 4) result.cantripsCount = 3;
    else result.cantripsCount = 2;
  } else if (['следопыт', 'искусственник'].includes(classNameLower)) {
    result.cantripsCount = 0; // Нет заговоров
  } else if (['воин (мистический рыцарь)', 'плут (мистический ловкач)'].includes(classNameLower)) {
    if (level >= 10) result.cantripsCount = 3;
    else result.cantripsCount = 2;
  } else if (classNameLower === 'паладин') {
    result.cantripsCount = 0; // Паладины не имеют заговоров
  }

  // Определение количества известных заклинаний
  if (classNameLower === 'бард') {
    result.knownSpells = Math.min(22, level + 3);
  } else if (classNameLower === 'чародей') {
    result.knownSpells = Math.min(15, level + 1);
  } else if (classNameLower === 'колдун') {
    // Специальный расчет для колдуна
    if (level === 1) result.knownSpells = 2;
    else if (level === 2) result.knownSpells = 3;
    else if (level === 3) result.knownSpells = 4;
    else if (level === 4) result.knownSpells = 5;
    else if (level === 5) result.knownSpells = 6;
    else if (level === 6) result.knownSpells = 7;
    else if (level === 7) result.knownSpells = 8;
    else if (level === 8) result.knownSpells = 9;
    else if (level === 9) result.knownSpells = 10;
    else if (level >= 10) result.knownSpells = 10 + Math.floor((level - 10) / 2) + 1;
  } else if (['волшебник', 'жрец', 'друид'].includes(classNameLower)) {
    // Для этих классов используется формула: уровень + модификатор способности
    result.knownSpells = level + modifierBonus;
  } else if (classNameLower === 'следопыт') {
    if (level >= 2) {
      result.knownSpells = Math.min(11, Math.floor(level / 2) + 1);
    }
  } else if (classNameLower === 'паладин') {
    if (level >= 2) {
      // Для паладинов: уровень / 2 + модификатор харизмы
      result.knownSpells = Math.floor(level / 2) + modifierBonus;
    }
  }

  return result;
};

/**
 * Вычисляет доступные заклинания по классу и уровню
 */
export const calculateAvailableSpellsByClassAndLevel = (
  className: string, 
  level: number,
  modifierBonus: number = 3
): { 
  maxLevel: number;
  cantripsCount: number;
  knownSpells: number;
  cantrips: number;
  spells: number;
  maxSpellLevel: number;
} => {
  return calculateKnownSpells(className, level, modifierBonus);
};

/**
 * Нормализует массив заклинаний для совместимости
 */
export const normalizeSpells = (spells: any[] | undefined): CharacterSpell[] => {
  if (!spells || !Array.isArray(spells)) return [];
  
  return spells.map(spell => {
    // Убеждаемся, что у заклинания есть все необходимые поля
    return {
      id: spell.id || `spell-${Math.random().toString(36).substr(2, 9)}`,
      name: spell.name || 'Неизвестное заклинание',
      level: typeof spell.level === 'number' ? spell.level : 0,
      school: spell.school || 'Общая',
      castingTime: spell.castingTime || spell.casting_time || '1 действие',
      range: spell.range || 'На себя',
      components: spell.components || 'В',
      duration: spell.duration || 'Мгновенная',
      description: spell.description || ['Нет описания'],
      prepared: typeof spell.prepared === 'boolean' ? spell.prepared : false,
      // Прочие поля заклинания
      ...spell
    };
  });
};

/**
 * Преобразует CharacterSpell в SpellData
 */
export const convertToSpellData = (spell: CharacterSpell): SpellData => {
  return {
    id: spell.id || `spell-${Math.random().toString(36).substr(2, 9)}`,
    name: spell.name,
    level: spell.level || 0,
    school: spell.school || 'Общая',
    castingTime: spell.castingTime || '1 действие',
    range: spell.range || 'На себя',
    components: spell.components || 'В',
    duration: spell.duration || 'Мгновенная',
    description: spell.description || ['Нет описания'],
    classes: spell.classes || [],
    ritual: spell.ritual || false,
    concentration: spell.concentration || false,
    verbal: (spell.components || '').includes('В'),
    somatic: (spell.components || '').includes('С'),
    material: (spell.components || '').includes('М'),
    higherLevel: spell.higherLevel || spell.higherLevels || '',
    source: spell.source || 'PHB'
  };
};

/**
 * Преобразует массив CharacterSpell в массив SpellData
 */
export const convertToSpellDataArray = (spells: CharacterSpell[]): SpellData[] => {
  return spells.map(convertToSpellData);
};

/**
 * Получает лимит подготовленных заклинаний для персонажа
 */
export const getPreparedSpellsLimit = (character: Character): number => {
  // Для заклинателей: уровень + модификатор характеристики
  const classModifier = getSpellcastingModifier(character);
  return character.level + (classModifier || 0);
};

/**
 * Получает модификатор характеристики для заклинаний
 */
const getSpellcastingModifier = (character: Character): number => {
  let abilityScore = 10;
  
  // Определяем ключевую характеристику для заклинаний
  if (['Жрец', 'Друид'].includes(character.class || '')) {
    abilityScore = character.wisdom || 10;
  } else if (['Волшебник', 'Маг', 'Искусственник'].includes(character.class || '')) {
    abilityScore = character.intelligence || 10;
  } else if (['Бард', 'Чародей', 'Колдун', 'Паладин'].includes(character.class || '')) {
    abilityScore = character.charisma || 10;
  }
  
  return Math.floor((abilityScore - 10) / 2);
};

/**
 * Проверяет, может ли персонаж подготовить еще заклинания
 */
export const canPrepareMoreSpells = (character: Character, abilityName?: string): boolean => {
  if (!character.spells || !Array.isArray(character.spells)) return true;
  
  const preparedSpells = character.spells.filter(spell => spell.prepared && spell.level > 0);
  const limit = getPreparedSpellsLimit(character);
  
  return preparedSpells.length < limit;
};
