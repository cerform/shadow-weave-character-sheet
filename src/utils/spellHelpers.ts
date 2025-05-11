
import { CharacterSpell } from '@/types/character';
import { SpellData } from '@/types/spells';

/**
 * Проверяет, является ли заклинание подготовленным
 * @param spell Объект заклинания или строка с названием
 * @returns true, если заклинание подготовлено
 */
export const isSpellPrepared = (spell: CharacterSpell | string): boolean => {
  if (typeof spell === 'string') return false;
  return spell.prepared === true;
};

/**
 * Получает уровень заклинания
 * @param spell Объект заклинания или строка с названием
 * @returns Уровень заклинания или 0 для кантрипов
 */
export const getSpellLevel = (spell: CharacterSpell | string): number => {
  if (typeof spell === 'string') return 0;
  return spell.level;
};

/**
 * Проверяет, является ли заклинание объектом CharacterSpell
 * @param spell Объект заклинания или строка с названием
 * @returns true, если заклинание - объект
 */
export const isCharacterSpellObject = (spell: CharacterSpell | string): spell is CharacterSpell => {
  return typeof spell !== 'string';
};

/**
 * Возвращает название уровня заклинания по его числовому значению
 * @param level Числовое значение уровня заклинания
 * @returns Строковое представление уровня заклинания на русском языке
 */
export const getSpellLevelName = (level: number): string => {
  switch (level) {
    case 0: return 'Заговор';
    case 1: return '1-й уровень';
    case 2: return '2-й уровень';
    case 3: return '3-й уровень';
    case 4: return '4-й уровень';
    case 5: return '5-й уровень';
    case 6: return '6-й уровень';
    case 7: return '7-й уровень';
    case 8: return '8-й уровень';
    case 9: return '9-й уровень';
    default: return `Уровень ${level}`;
  }
};

/**
 * Преобразует массив CharacterSpell в массив SpellData
 * @param spells Массив заклинаний
 * @returns Массив объектов SpellData
 */
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
        id: spell.id || `spell-${spell.name.replace(/\s+/g, '-').toLowerCase()}`
      };
    }
  });
};

/**
 * Проверяет, может ли персонаж подготовить еще заклинания
 * @param character Объект персонажа
 * @returns true, если можно подготовить еще заклинания
 */
export const canPrepareMoreSpells = (character: any): boolean => {
  if (!character || !character.spells) return false;
  
  const limit = getPreparedSpellsLimit(character);
  
  // Если лимита нет, можно подготовить любое количество заклинаний
  if (limit <= 0) return true;
  
  // Подсчитываем количество подготовленных заклинаний
  const preparedCount = character.spells
    .filter((spell: CharacterSpell | string) => {
      if (typeof spell === 'string') return false;
      return spell.prepared && spell.level > 0; // Заговоры не учитываем
    })
    .length;
  
  return preparedCount < limit;
};

/**
 * Получает лимит подготовленных заклинаний для персонажа
 * @param character Объект персонажа
 * @returns Максимальное количество заклинаний, которые может подготовить персонаж
 */
export const getPreparedSpellsLimit = (character: any): number => {
  if (!character || !character.class || !character.level) return 0;
  
  const classLower = character.class.toLowerCase();
  
  // Классы, которые должны готовить заклинания
  const prepareClasses = [
    'жрец', 'друид', 'волшебник', 'cleric', 'druid', 
    'wizard', 'паладин', 'paladin', 'следопыт', 'ranger'
  ];
  
  // Если класс не требует подготовки заклинаний, возвращаем 0
  if (!prepareClasses.includes(classLower)) return 0;
  
  // Получаем модификатор основной характеристики
  let abilityModifier = 0;
  
  if (['жрец', 'друид', 'следопыт', 'cleric', 'druid', 'ranger'].includes(classLower)) {
    // Мудрость для жрецов, друидов и следопытов
    const wisdom = character.abilities?.wisdom || character.abilities?.WIS || 10;
    abilityModifier = Math.floor((wisdom - 10) / 2);
  } else if (['волшебник', 'wizard'].includes(classLower)) {
    // Интеллект для волшебников
    const intelligence = character.abilities?.intelligence || character.abilities?.INT || 10;
    abilityModifier = Math.floor((intelligence - 10) / 2);
  } else if (['паладин', 'paladin'].includes(classLower)) {
    // Харизма для паладинов
    const charisma = character.abilities?.charisma || character.abilities?.CHA || 10;
    abilityModifier = Math.floor((charisma - 10) / 2);
  }
  
  // Расчет лимита подготовленных заклинаний
  if (['жрец', 'друид', 'cleric', 'druid'].includes(classLower)) {
    // Жрецы и друиды: уровень + модификатор мудрости
    return character.level + abilityModifier;
  } else if (['волшебник', 'wizard'].includes(classLower)) {
    // Волшебники: уровень + модификатор интеллекта
    return character.level + abilityModifier;
  } else if (['паладин', 'палладин', 'paladin'].includes(classLower)) {
    // Паладины: половина уровня + модификатор харизмы
    return Math.floor(character.level / 2) + abilityModifier;
  } else if (['следопыт', 'ranger'].includes(classLower)) {
    // Следопыты: половина уровня + модификатор мудрости
    return Math.floor(character.level / 2) + abilityModifier;
  }
  
  return 0;
};

/**
 * Нормализует массив заклинаний персонажа
 * @param spells Массив заклинаний
 * @returns Нормализованный массив заклинаний
 */
export const normalizeSpells = (spells: any[]): (CharacterSpell | string)[] => {
  if (!spells || !Array.isArray(spells)) return [];
  
  return spells.map(spell => {
    if (typeof spell === 'string') return spell;
    
    return {
      name: spell.name || 'Неизвестное заклинание',
      level: spell.level || 0,
      school: spell.school || 'Универсальная',
      prepared: spell.prepared || false,
    };
  });
};

/**
 * Преобразует массив заклинаний в SpellData
 * @param spells Массив заклинаний
 * @returns Массив объектов SpellData
 */
export const convertToSpellData = (spells: any[]): SpellData[] => {
  return convertCharacterSpellsToSpellData(spells);
};

