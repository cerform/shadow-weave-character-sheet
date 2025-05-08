
import { Character, CharacterSpell } from '@/types/character';
import { SpellData } from '@/types/spells';

/**
 * Вычисляет доступные заклинания на основе класса и уровня
 */
export const calculateAvailableSpellsByClassAndLevel = (
  characterClass: string,
  level: number,
  spellcastingModifier = 0
) => {
  const lowerClass = characterClass.toLowerCase();
  let maxSpellLevel = 0;
  let cantripsCount = 0;
  let knownSpells = 0;
  
  // Вычисляем максимальный уровень заклинаний на основе уровня персонажа
  if (level >= 1) {
    maxSpellLevel = Math.ceil(level / 2);
    if (maxSpellLevel > 9) maxSpellLevel = 9;
  }
  
  // Определяем количество заговоров в зависимости от класса и уровня
  switch (lowerClass) {
    case 'бард':
    case 'bard':
      cantripsCount = 2 + Math.floor((level - 1) / 6);
      knownSpells = level + 3;
      break;
      
    case 'жрец':
    case 'cleric':
      cantripsCount = 3 + Math.floor(level / 10);
      // Жрец знает все заклинания класса, но готовит только часть
      knownSpells = 999;
      break;
      
    case 'друид':
    case 'druid':
      cantripsCount = 2 + Math.floor(level / 4);
      // Друид знает все заклинания класса, но готовит только часть
      knownSpells = 999;
      break;
      
    case 'паладин':
    case 'paladin':
      if (level >= 2) {
        // Паладины получают заклинания с 2-го уровня
        maxSpellLevel = Math.ceil((level - 1) / 2);
        if (maxSpellLevel > 5) maxSpellLevel = 5; // Паладины могут выучить заклинания до 5-го уровня
        knownSpells = 999; // Знают все заклинания класса, но готовят только часть
      } else {
        maxSpellLevel = 0;
      }
      cantripsCount = 0; // У паладинов нет заговоров
      break;
      
    case 'следопыт':
    case 'ranger':
      if (level >= 2) {
        // Следопыты получают заклинания с 2-го уровня
        maxSpellLevel = Math.ceil((level - 1) / 2);
        if (maxSpellLevel > 5) maxSpellLevel = 5; // Следопыты могут выучить заклинания до 5-го уровня
        knownSpells = level - 1; // Следопыты знают ограниченное количество заклинаний
      } else {
        maxSpellLevel = 0;
      }
      cantripsCount = 0; // У следопытов нет заговоров
      break;
      
    case 'чародей':
    case 'sorcerer':
      cantripsCount = 4 + Math.floor(level / 6);
      knownSpells = level + 1;
      break;
      
    case 'колдун':
    case 'warlock':
      cantripsCount = 2 + Math.floor(level / 4);
      knownSpells = Math.min(level + 1 + Math.floor(level / 2), 15);
      // У колдунов особый механизм уровня заклинаний:
      if (level >= 1 && level < 3) maxSpellLevel = 1;
      else if (level >= 3 && level < 5) maxSpellLevel = 2;
      else if (level >= 5 && level < 7) maxSpellLevel = 3;
      else if (level >= 7 && level < 9) maxSpellLevel = 4;
      else if (level >= 9) maxSpellLevel = 5;
      break;
      
    case 'волшебник':
    case 'wizard':
      cantripsCount = 3 + Math.floor(level / 5);
      knownSpells = level * 2; // Волшебники могут записывать любое количество заклинаний в книгу
      break;
      
    case 'изобретатель':
    case 'artificer':
      if (level >= 1) {
        cantripsCount = 2 + Math.floor(level / 8);
        knownSpells = 999; // Изобретатели знают все заклинания своего класса
        maxSpellLevel = Math.ceil(level / 2);
        if (maxSpellLevel > 5) maxSpellLevel = 5; // Изобретатели могут выучить заклинания до 5-го уровня
      }
      break;
      
    default:
      // Для других классов нет заклинаний
      maxSpellLevel = 0;
      cantripsCount = 0;
      knownSpells = 0;
  }
  
  // Если класс готовит заклинания, вычисляем предел подготовленных заклинаний
  const preparedSpellsLimit = getPreparedSpellsLimit({
    class: characterClass,
    level,
    abilities: {
      wisdom: 10 + spellcastingModifier * 2,
      intelligence: 10 + spellcastingModifier * 2,
      charisma: 10 + spellcastingModifier * 2,
      strength: 10,
      dexterity: 10,
      constitution: 10
    }
  });
  
  return { maxSpellLevel, cantripsCount, knownSpells, preparedSpellsLimit };
};

/**
 * Преобразует заклинания персонажа в единый формат объектов
 */
export const normalizeSpells = (character: Character): CharacterSpell[] => {
  if (!character.spells || !Array.isArray(character.spells)) return [];
  
  return character.spells.map(spell => {
    if (typeof spell === 'string') {
      // Преобразуем строку в базовый объект заклинания
      return {
        name: spell,
        level: 0,
        prepared: true
      };
    }
    return spell;
  }).sort((a, b) => {
    // Сортируем по уровню, а затем по имени
    if (a.level === b.level) {
      return a.name.localeCompare(b.name);
    }
    return (a.level || 0) - (b.level || 0);
  });
};

/**
 * Конвертирует заклинания для хранения в состоянии
 */
export const convertSpellsForState = (spells: CharacterSpell[] | SpellData[]): CharacterSpell[] => {
  return spells.map(spell => ({
    id: spell.id || `spell-${spell.name.replace(/\s+/g, '-').toLowerCase()}`,
    name: spell.name,
    level: spell.level || 0,
    school: spell.school || '',
    castingTime: spell.castingTime || '',
    range: spell.range || '',
    components: spell.components || '',
    duration: spell.duration || '',
    description: spell.description || '',
    prepared: 'prepared' in spell ? Boolean(spell.prepared) : true,
    ritual: 'ritual' in spell ? Boolean(spell.ritual) : false,
    concentration: 'concentration' in spell ? Boolean(spell.concentration) : false,
    classes: spell.classes || []
  }));
};

/**
 * Вычисляет предел подготовленных заклинаний для классов, которые готовят заклинания
 */
export const getPreparedSpellsLimit = (character: Character): number => {
  if (!character || !character.class) return 0;
  
  const classLower = character.class.toLowerCase();
  const level = character.level || 1;
  
  // Классы, которые не готовят заклинания
  const nonPreparingClasses = ['бард', 'чародей', 'колдун', 'bard', 'sorcerer', 'warlock'];
  if (nonPreparingClasses.includes(classLower)) {
    return 0; // Эти классы не готовят заклинания
  }
  
  // Определяем, какую характеристику использовать
  let modifier = 0;
  if (['жрец', 'друид', 'cleric', 'druid'].includes(classLower)) {
    // Мудрость
    const wisdom = character.abilities?.wisdom || character.wisdom || 10;
    modifier = Math.floor((wisdom - 10) / 2);
  } else if (['волшебник', 'изобретатель', 'wizard', 'artificer'].includes(classLower)) {
    // Интеллект
    const intelligence = character.abilities?.intelligence || character.intelligence || 10;
    modifier = Math.floor((intelligence - 10) / 2);
  } else if (['паладин', 'следопыт', 'paladin', 'ranger'].includes(classLower)) {
    // Харизма для паладина, Мудрость для следопыта
    if (['паладин', 'paladin'].includes(classLower)) {
      const charisma = character.abilities?.charisma || character.charisma || 10;
      modifier = Math.floor((charisma - 10) / 2);
    } else {
      const wisdom = character.abilities?.wisdom || character.wisdom || 10;
      modifier = Math.floor((wisdom - 10) / 2);
    }
  }
  
  // Вычисляем предел подготовленных заклинаний
  // Формула: уровень + модификатор характеристики
  // Специальная формула для паладинов и следопытов: (уровень / 2) + модификатор характеристики
  if (['паладин', 'следопыт', 'paladin', 'ranger'].includes(classLower)) {
    return Math.max(1, Math.floor(level / 2) + modifier);
  } else {
    return Math.max(1, level + modifier);
  }
};

/**
 * Проверяет, может ли персонаж подготовить еще заклинания
 */
export const canPrepareMoreSpells = (character: Character): boolean => {
  if (!character || !character.spells) return false;
  
  // Проверяем, является ли класс тем, который готовит заклинания
  const preparingLimit = getPreparedSpellsLimit(character);
  if (preparingLimit <= 0) return true; // Если класс не готовит заклинания, ограничений нет
  
  // Считаем количество уже подготовленных заклинаний (не считая заговоры)
  const preparedCount = character.spells.filter(spell => {
    if (typeof spell === 'string') return false;
    return spell.prepared && spell.level > 0;
  }).length;
  
  return preparedCount < preparingLimit;
};

/**
 * Вычисляет максимальный уровень доступных заклинаний
 */
export const getMaxSpellLevel = (characterClass: string, level: number): number => {
  const lowerClass = characterClass.toLowerCase();
  let maxLevel = 0;
  
  if (['паладин', 'следопыт', 'paladin', 'ranger', 'изобретатель', 'artificer'].includes(lowerClass)) {
    // Эти классы имеют максимальный уровень заклинаний 5
    maxLevel = Math.min(5, Math.ceil((level - 1) / 2));
  } else if (['колдун', 'warlock'].includes(lowerClass)) {
    // У колдунов особый механизм уровня заклинаний
    if (level >= 1 && level < 3) maxLevel = 1;
    else if (level >= 3 && level < 5) maxLevel = 2;
    else if (level >= 5 && level < 7) maxLevel = 3;
    else if (level >= 7 && level < 9) maxLevel = 4;
    else if (level >= 9) maxLevel = 5;
  } else if (level > 0) {
    // Для остальных классов: (уровень / 2) + 0.5, округленное вниз
    maxLevel = Math.ceil(level / 2);
  }
  
  return Math.min(9, Math.max(0, maxLevel));
};

/**
 * Преобразует CharacterSpell в SpellData
 */
export const convertToSpellData = (spell: CharacterSpell): SpellData => {
  return {
    id: spell.id || `spell-${spell.name.replace(/\s+/g, '-').toLowerCase()}`,
    name: spell.name,
    level: spell.level || 0,
    school: spell.school || 'Универсальная',
    castingTime: spell.castingTime || '1 действие',
    range: spell.range || 'На себя',
    components: spell.components || '',
    duration: spell.duration || 'Мгновенная',
    description: spell.description || 'Нет описания',
    classes: spell.classes || [],
    ritual: spell.ritual || false,
    concentration: spell.concentration || false,
    prepared: spell.prepared || false
  };
};
