
import { Character, CharacterSpell } from '@/types/character';
import { SpellData } from '@/types/spells';

/**
 * Преобразует строки или массивы в безопасном режиме
 * @param description Описание заклинания
 * @returns Нормализованное описание
 */
export const safelyConvertSpellDescription = (description: string | string[]): string => {
  if (Array.isArray(description)) {
    return description.join('\n');
  }
  return description || '';
};

/**
 * Преобразует классы заклинаний в безопасном режиме
 * @param classes Классы заклинания
 * @returns Массив классов
 */
export const safelyConvertSpellClasses = (classes: string[] | string | undefined): string[] => {
  if (!classes) return [];
  if (typeof classes === 'string') return [classes];
  return classes;
};

/**
 * Вычисляет доступные заклинания по классу и уровню
 * @param characterClass Класс персонажа
 * @param level Уровень персонажа
 * @param modifier Модификатор основной характеристики
 * @returns Информация о доступных заклинаниях
 */
export const calculateAvailableSpellsByClassAndLevel = (
  characterClass: string,
  level: number,
  modifier: number
) => {
  // Получаем информацию о количестве заклинаний по классу и уровню
  let cantripsCount = 0;
  let knownSpells = 0;
  let maxSpellLevel = 0;
  
  // Приводим класс к нижнему регистру для сравнения
  const classLower = characterClass.toLowerCase();
  
  // Определяем максимальный уровень заклинаний
  maxSpellLevel = Math.min(9, Math.ceil(level / 2));
  
  // Определяем количество заговоров
  if (['wizard', 'волшебник'].includes(classLower)) {
    cantripsCount = level < 4 ? 3 : level < 10 ? 4 : 5;
    knownSpells = level + modifier; // Волшебник может подготовить уровень + модификатор интеллекта
  } else if (['cleric', 'жрец', 'druid', 'друид'].includes(classLower)) {
    cantripsCount = level < 4 ? 3 : level < 10 ? 4 : 5;
    knownSpells = level + modifier; // Жрец и друид могут подготовить уровень + модификатор мудрости
  } else if (['bard', 'бард'].includes(classLower)) {
    cantripsCount = 2;
    knownSpells = getKnownSpellsForBard(level);
  } else if (['sorcerer', 'чародей'].includes(classLower)) {
    cantripsCount = 4;
    knownSpells = getKnownSpellsForSorcerer(level);
  } else if (['warlock', 'колдун'].includes(classLower)) {
    cantripsCount = level < 4 ? 2 : level < 10 ? 3 : 4;
    knownSpells = getKnownSpellsForWarlock(level);
  } else if (['paladin', 'паладин'].includes(classLower)) {
    cantripsCount = 0; // У паладинов нет заговоров
    knownSpells = Math.floor(level / 2) + modifier; // Половина уровня + модификатор харизмы
    maxSpellLevel = Math.min(5, Math.ceil(level / 2)); // Максимальный уровень заклинаний паладина - 5
  } else if (['ranger', 'следопыт'].includes(classLower)) {
    cantripsCount = 0; // У следопытов нет заговоров
    knownSpells = Math.floor(level / 2) + modifier; // Половина уровня + модификатор мудрости
    maxSpellLevel = Math.min(5, Math.ceil(level / 2)); // Максимальный уровень заклинаний следопыта - 5
  } else {
    // Для других классов (или если класс не распознан)
    cantripsCount = 3;
    knownSpells = level + modifier;
  }
  
  // Убеждаемся, что minSpellsKnown не отрицательное число
  knownSpells = Math.max(1, knownSpells);
  
  return {
    cantripsCount,
    knownSpells,
    maxSpellLevel
  };
};

// Вспомогательные функции для определения количества известных заклинаний
const getKnownSpellsForBard = (level: number): number => {
  const knownSpellsByLevel = [0, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15, 15, 16, 18, 19, 19, 20, 22, 22, 22];
  return knownSpellsByLevel[level] || 4;
};

const getKnownSpellsForSorcerer = (level: number): number => {
  const knownSpellsByLevel = [0, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 12, 13, 13, 14, 14, 15, 15, 15, 15];
  return knownSpellsByLevel[level] || 2;
};

const getKnownSpellsForWarlock = (level: number): number => {
  const knownSpellsByLevel = [0, 2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 11, 11, 12, 12, 13, 13, 14, 14, 15, 15];
  return knownSpellsByLevel[level] || 2;
};

/**
 * Проверяет, может ли персонаж подготовить больше заклинаний
 * @param character Персонаж
 * @returns true, если персонаж может подготовить больше заклинаний
 */
export const canPrepareMoreSpells = (character: Character): boolean => {
  if (!character) return false;
  
  const preparedLimit = getPreparedSpellsLimit(character);
  const preparedCount = (character.spells || [])
    .filter(spell => {
      if (typeof spell === 'string') return false;
      return spell.prepared && spell.level > 0;
    }).length;
  
  return preparedCount < preparedLimit;
};

/**
 * Получает лимит подготовленных заклинаний для персонажа
 * @param character Персонаж
 * @returns Максимальное количество заклинаний, которое может подготовить персонаж
 */
export const getPreparedSpellsLimit = (character: Character): number => {
  if (!character) return 0;
  
  const classLower = character.class ? character.class.toLowerCase() : '';
  const level = character.level || 1;
  
  // Определяем базовую характеристику в зависимости от класса
  let ability = '';
  if (['жрец', 'друид', 'cleric', 'druid'].includes(classLower)) {
    ability = 'wisdom';
  } else if (['волшебник', 'wizard', 'artificer', 'изобретатель'].includes(classLower)) {
    ability = 'intelligence';
  } else if (['паладин', 'paladin'].includes(classLower)) {
    ability = 'charisma';
  } else if (['следопыт', 'ranger'].includes(classLower)) {
    ability = 'wisdom';
  } else {
    return 99; // Для остальных классов не ограничиваем количество подготовленных заклинаний
  }
  
  // Получаем значение характеристики
  const abilityValue = 
    character.abilities?.[ability as keyof typeof character.abilities] || 
    character[ability as keyof typeof character] || 
    10;
  
  // Определяем модификатор
  const modifier = Math.floor((abilityValue - 10) / 2);
  
  // Вычисляем лимит заклинаний
  let limit: number;
  if (['artificer', 'изобретатель'].includes(classLower)) {
    limit = Math.ceil(level / 2) + modifier;
  } else if (['паладин', 'paladin', 'следопыт', 'ranger'].includes(classLower)) {
    limit = Math.floor(level / 2) + modifier;
  } else {
    limit = level + modifier;
  }
  
  return Math.max(1, limit); // Минимум 1 заклинание
};

/**
 * Нормализует заклинания персонажа, преобразуя строки в объекты CharacterSpell
 * @param character Персонаж
 * @returns Массив нормализованных заклинаний
 */
export const normalizeSpells = (character: Character): CharacterSpell[] => {
  if (!character.spells || !Array.isArray(character.spells)) return [];
  
  return character.spells.map(spell => {
    if (typeof spell === 'string') {
      // Преобразуем строку в базовый объект заклинания
      return {
        id: `spell-${spell.toLowerCase().replace(/\s+/g, '-')}`,
        name: spell,
        level: 0, // По умолчанию считаем заговором
        school: 'Универсальная',
        castingTime: '1 действие',
        range: 'На себя',
        components: '',
        duration: 'Мгновенная',
        description: 'Нет описания',
        prepared: true // По умолчанию считаем подготовленным
      };
    }
    return spell;
  });
};

/**
 * Преобразует CharacterSpell в SpellData
 * @param spell Заклинание персонажа
 * @returns Объект SpellData
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

/**
 * Фильтрует заклинания по классу и уровню
 * @param spells Список всех заклинаний
 * @param characterClass Класс персонажа
 * @param characterLevel Уровень персонажа
 * @returns Отфильтрованный список заклинаний
 */
export const filterSpellsByClassAndLevel = (
  spells: SpellData[],
  characterClass: string,
  characterLevel: number = 1
): SpellData[] => {
  const classLower = characterClass.toLowerCase();
  const maxSpellLevel = Math.ceil(characterLevel / 2);
  
  return spells.filter(spell => {
    // Проверяем уровень заклинания
    if (spell.level > maxSpellLevel) return false;
    
    // Если у заклинания нет списка классов, пропускаем его
    if (!spell.classes) return false;
    
    // Преобразуем classes в массив
    const classes = Array.isArray(spell.classes) ? spell.classes : [spell.classes];
    
    // Проверяем, доступно ли заклинание для класса персонажа
    return classes.some(cls => {
      const classStr = typeof cls === 'string' ? cls.toLowerCase() : '';
      
      return classStr === classLower || 
        (classLower === 'жрец' && classStr === 'cleric') ||
        (classLower === 'волшебник' && classStr === 'wizard') ||
        (classLower === 'друид' && classStr === 'druid') ||
        (classLower === 'бард' && classStr === 'bard') ||
        (classLower === 'колдун' && classStr === 'warlock') ||
        (classLower === 'чародей' && classStr === 'sorcerer') ||
        (classLower === 'паладин' && classStr === 'paladin') ||
        (classLower === 'следопыт' && classStr === 'ranger');
    });
  });
};
