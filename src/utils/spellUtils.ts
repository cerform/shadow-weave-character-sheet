
import { Character, CharacterSpell } from '@/types/character';
import { SpellData } from '@/types/spells';

/**
 * Получает максимальный доступный уровень заклинаний на основе уровня персонажа
 * @param characterLevel Уровень персонажа
 * @returns Максимальный уровень заклинаний
 */
export const getMaxSpellLevel = (characterLevel: number): number => {
  if (characterLevel < 3) return 1;
  if (characterLevel < 5) return 2;
  if (characterLevel < 7) return 3;
  if (characterLevel < 9) return 4;
  if (characterLevel < 11) return 5;
  if (characterLevel < 13) return 6;
  if (characterLevel < 15) return 7;
  if (characterLevel < 17) return 8;
  return 9;
};

/**
 * Вычисляет доступные заклинания по классу и уровню персонажа
 * @param characterClass Класс персонажа
 * @param characterLevel Уровень персонажа
 * @param modifier Модификатор основной характеристики (опционально)
 * @returns Информация о доступных заклинаниях
 */
export const calculateAvailableSpellsByClassAndLevel = (
  characterClass: string,
  characterLevel: number,
  modifier?: number
) => {
  const maxLevel = getMaxSpellLevel(characterLevel);
  
  // Количество заговоров по классу и уровню
  let cantripsCount = 0;
  
  switch (characterClass.toLowerCase()) {
    case 'бард':
      cantripsCount = characterLevel >= 10 ? 4 : (characterLevel >= 4 ? 3 : 2);
      break;
    case 'жрец':
    case 'друид':
    case 'волшебник':
      cantripsCount = characterLevel >= 10 ? 5 : (characterLevel >= 4 ? 4 : 3);
      break;
    case 'чародей':
      cantripsCount = characterLevel >= 10 ? 6 : (characterLevel >= 4 ? 5 : 4);
      break;
    case 'колдун':
      cantripsCount = characterLevel >= 10 ? 4 : (characterLevel >= 4 ? 3 : 2);
      break;
    default:
      cantripsCount = 0;
  }
  
  // Количество изученных заклинаний (для классов, которые заучивают, а не готовят)
  let knownSpells = 0;
  
  switch (characterClass.toLowerCase()) {
    case 'бард':
      knownSpells = Math.min(22, 4 + Math.floor((characterLevel - 1) * 1.5));
      break;
    case 'чародей':
      knownSpells = Math.min(15, characterLevel + 1);
      break;
    case 'колдун':
      knownSpells = Math.min(15, characterLevel + 1);
      break;
    case 'следопыт':
      knownSpells = Math.max(0, Math.floor((characterLevel - 1) / 2) + 2);
      break;
    case 'жрец':
    case 'друид':
      // Жрецы и друиды готовят заклинания, а не заучивают
      if (modifier !== undefined) {
        // Уровень + модификатор основной характеристики
        knownSpells = characterLevel + modifier;
      } else {
        // Стандартное значение, если модификатор не указан
        knownSpells = characterLevel + 3;
      }
      break;
    default:
      knownSpells = 0;
  }
  
  return {
    maxLevel,
    cantripsCount,
    knownSpells
  };
};

/**
 * Фильтрует заклинания по классу и уровню персонажа
 * @param spells Массив заклинаний
 * @param characterClass Класс персонажа
 * @param characterLevel Уровень персонажа
 * @returns Отфильтрованный массив заклинаний
 */
export const filterSpellsByClassAndLevel = (
  spells: SpellData[],
  characterClass: string
): SpellData[] => {
  return spells.filter(spell => {
    // Проверяем принадлежность заклинания к классу
    const belongsToClass = typeof spell.classes === 'string' 
      ? spell.classes.toLowerCase().includes(characterClass.toLowerCase())
      : Array.isArray(spell.classes) && spell.classes.some(cls => 
          cls.toLowerCase().includes(characterClass.toLowerCase())
        );
    
    return belongsToClass;
  });
};

/**
 * Нормализует массив заклинаний персонажа, преобразуя строки в объекты CharacterSpell
 * @param character Персонаж
 * @returns Массив объектов CharacterSpell
 */
export const normalizeSpells = (character: Character): CharacterSpell[] => {
  if (!character.spells || !Array.isArray(character.spells)) return [];
  
  return character.spells.map(spell => {
    if (typeof spell === 'string') {
      // Преобразуем строку в базовый объект CharacterSpell
      return {
        id: `spell-${spell.toLowerCase().replace(/\s+/g, '-')}`,
        name: spell,
        level: 0, // По умолчанию считаем заговором
        school: 'Неизвестная',
        castingTime: '1 действие',
        range: 'На себя',
        components: '',
        duration: 'Мгновенная',
        description: 'Нет описания'
      };
    }
    return spell;
  });
};

/**
 * Преобразует объект CharacterSpell в SpellData
 */
export const convertToSpellData = (spell: CharacterSpell): SpellData => {
  return {
    id: spell.id || `spell-${spell.name.toLowerCase().replace(/\s+/g, '-')}`,
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
 * Проверяет, может ли персонаж подготовить еще заклинания
 * @param character Персонаж
 * @returns true, если персонаж может подготовить еще заклинания
 */
export const canPrepareMoreSpells = (character: Character): boolean => {
  const limit = getPreparedSpellsLimit(character);
  const prepared = character.spells?.filter(s => typeof s !== 'string' && s.prepared && s.level > 0).length || 0;
  return prepared < limit;
};

/**
 * Получает лимит подготовленных заклинаний для персонажа
 * @param character Персонаж
 * @returns Максимальное количество заклинаний, которые персонаж может подготовить
 */
export const getPreparedSpellsLimit = (character: Character): number => {
  if (!character) return 0;

  const classLower = character.class ? character.class.toLowerCase() : '';
  
  // Классы, которые должны готовить заклинания
  const preparingClasses = ['жрец', 'друид', 'волшебник', 'cleric', 'druid', 'wizard', 'паладин', 'paladin', 'следопыт', 'ranger', 'изобретатель', 'artificer'];
  
  if (!preparingClasses.includes(classLower)) {
    return Infinity; // Для классов, которые не готовят заклинания, возвращаем бесконечность
  }
  
  let modifier = 0;
  
  // Определяем модификатор характеристики на основе класса
  if (['жрец', 'друид', 'cleric', 'druid'].includes(classLower)) {
    // Мудрость
    const wisdom = character.abilities?.wisdom || character.wisdom || 10;
    modifier = Math.floor((wisdom - 10) / 2);
  } else if (['волшебник', 'wizard', 'изобретатель', 'artificer'].includes(classLower)) {
    // Интеллект
    const intelligence = character.abilities?.intelligence || character.intelligence || 10;
    modifier = Math.floor((intelligence - 10) / 2);
  } else if (['паладин', 'палладин', 'paladin', 'следопыт', 'ranger'].includes(classLower)) {
    // Харизма для паладина, Мудрость для следопыта
    if (['паладин', 'палладин', 'paladin'].includes(classLower)) {
      const charisma = character.abilities?.charisma || character.charisma || 10;
      modifier = Math.floor((charisma - 10) / 2);
    } else {
      const wisdom = character.abilities?.wisdom || character.wisdom || 10;
      modifier = Math.floor((wisdom - 10) / 2);
    }
  }
  
  // Базовая формула: уровень + модификатор характеристики
  return character.level + modifier;
};

/**
 * Безопасно конвертирует описание заклинания из разных типов в строковое представление
 * @param description Описание заклинания (строка или массив строк)
 * @returns Строковое описание заклинания
 */
export const safelyConvertSpellDescription = (description: string | string[] | undefined): string => {
  if (!description) return '';
  if (typeof description === 'string') return description;
  if (Array.isArray(description)) return description.join(' ');
  return String(description);
};

/**
 * Безопасно конвертирует классы заклинания из разных типов в массив строк
 * @param classes Классы заклинания (строка, массив строк или undefined)
 * @returns Массив классов заклинания
 */
export const safelyConvertSpellClasses = (classes: string | string[] | undefined): string[] => {
  if (!classes) return [];
  if (typeof classes === 'string') return [classes];
  if (Array.isArray(classes)) return classes;
  return [];
};
