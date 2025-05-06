
import { Character, CharacterSpell } from '@/types/character';
import { SpellData } from '@/types/spells';

// Преобразование в объект SpellData для использования в компонентах
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
    description: spell.description || ['Нет описания'],
    classes: spell.classes || [],
    prepared: spell.prepared || false,
    ritual: spell.ritual || false,
    concentration: spell.concentration || false
  };
};

/**
 * Нормализует заклинания персонажа, преобразуя строковые значения в объекты
 */
export const normalizeSpells = (character: Character): CharacterSpell[] => {
  if (!character.spells || !Array.isArray(character.spells)) {
    return [];
  }

  return character.spells.map(spell => {
    if (typeof spell === 'string') {
      // Преобразуем строковое значение в объект CharacterSpell
      return {
        id: `spell-${spell.replace(/\s+/g, '-').toLowerCase()}`,
        name: spell,
        level: 0,
        prepared: true
      };
    }
    return spell;
  });
};

/**
 * Вычисляет количество известных заклинаний исходя из класса и уровня
 */
export const calculateKnownSpells = (characterClass: string, level: number): number => {
  // Значения по умолчанию
  let knownSpells = level + 1;
  
  if (!characterClass) return 0;
  
  const className = characterClass.toLowerCase();
  
  // Классы со специфическими правилами для количества заклинаний
  switch (className) {
    case 'бард':
    case 'bard':
      // Барды: 4 на 1 уровне, +1 на каждый уровень
      knownSpells = level + 3;
      break;
    case 'чародей':
    case 'sorcerer':
      // Чародеи: 2 на 1 уровне, +1 на каждый уровень
      knownSpells = level + 1;
      break;
    case 'колдун':
    case 'warlock':
      // Колдуны: 2 на 1 уровне, +1 на каждый уровень
      knownSpells = level + 1;
      break;
    case 'волшебник':
    case 'wizard':
      // Волшебники: 6 на 1 уровне, +2 на каждый уровень
      knownSpells = 6 + (level - 1) * 2;
      break;
    case 'жрец':
    case 'cleric':
    case 'друид':
    case 'druid':
      // Жрецы и друиды: уровень + модификатор способности
      knownSpells = level + 1; // +1 как примерный модификатор, точный расчет в другом месте
      break;
    case 'паладин':
    case 'paladin':
    case 'следопыт':
    case 'ranger':
      // Паладины/Следопыты: доступ к заклинаниям с 2 уровня
      if (level < 2) return 0;
      knownSpells = Math.floor(level / 2) + 1; // +1 как примерный модификатор
      break;
    default:
      // Для неизвестных классов используем формулу по умолчанию
      knownSpells = level;
  }
  
  return Math.max(0, knownSpells);
};

/**
 * Вычисляет максимальный уровень заклинаний доступный персонажу
 */
export const getMaxSpellLevel = (characterClass: string, level: number): number => {
  // По умолчанию
  if (!characterClass || level < 1) return 0;
  
  const className = characterClass.toLowerCase();
  
  // Паладины и следопыты получают доступ к заклинаниям с 2 уровня
  // и прогрессируют медленнее других классов
  if (['паладин', 'следопыт', 'paladin', 'ranger'].includes(className)) {
    if (level < 2) return 0;
    return Math.min(5, Math.ceil(level / 4)); // Макс. 5 уровень
  }
  
  // Колдун прогрессирует немного иначе
  if (['колдун', 'warlock'].includes(className)) {
    if (level < 1) return 0;
    if (level < 3) return 1;
    if (level < 5) return 2;
    if (level < 7) return 3;
    if (level < 9) return 4;
    return 5; // Макс. 5 уровень для колдуна
  }
  
  // Для полных заклинателей (бард, жрец, друид, волшебник, чародей)
  if (['бард', 'жрец', 'друид', 'волшебник', 'чародей', 'bard', 'cleric', 'druid', 'wizard', 'sorcerer'].includes(className)) {
    if (level < 1) return 0;
    
    // Стандартная прогрессия полных заклинателей
    if (level < 3) return 1;
    if (level < 5) return 2;
    if (level < 7) return 3;
    if (level < 9) return 4;
    if (level < 11) return 5;
    if (level < 13) return 6;
    if (level < 15) return 7;
    if (level < 17) return 8;
    return 9; // Макс. 9 уровень
  }
  
  // Для всех остальных классов возвращаем 0
  return 0;
};

/**
 * Расчет количества заговоров для класса и уровня
 */
export const calculateCantripCount = (characterClass: string, level: number): number => {
  if (!characterClass || level < 1) return 0;
  
  const className = characterClass.toLowerCase();
  
  // Классы с заговорами
  switch (className) {
    case 'бард':
    case 'bard':
      // 2 заговора на 1 уровне, +1 на 10 уровне
      return 2 + (level >= 10 ? 1 : 0);
      
    case 'жрец':
    case 'cleric':
      // 3 заговора на 1 уровне, +1 на 4 и 10 уровнях
      return 3 + (level >= 4 ? 1 : 0) + (level >= 10 ? 1 : 0);
      
    case 'друид':
    case 'druid':
      // 2 заговора на 1 уровне, +1 на 4 и 10 уровнях
      return 2 + (level >= 4 ? 1 : 0) + (level >= 10 ? 1 : 0);
      
    case 'волшебник':
    case 'wizard':
      // 3 заговора на 1 уровне, +1 на 4 и 10 уровнях
      return 3 + (level >= 4 ? 1 : 0) + (level >= 10 ? 1 : 0);
      
    case 'чародей':
    case 'sorcerer':
      // 4 заговора на 1 уровне, +1 на 4 и 10 уровнях
      return 4 + (level >= 4 ? 1 : 0) + (level >= 10 ? 1 : 0);
      
    case 'колдун':
    case 'warlock':
      // 2 заговора на 1 уровне, +1 на 4 и 10 уровнях
      return 2 + (level >= 4 ? 1 : 0) + (level >= 10 ? 1 : 0);
      
    case 'следопыт':
    case 'ranger':
      // Следопыты получают заговоры с 2 уровня (в зависимости от издания)
      return level >= 2 ? 2 : 0;
      
    default:
      return 0;
  }
};

/**
 * Расчет доступных заклинаний для класса и уровня
 * @param characterClass Класс персонажа
 * @param level Уровень персонажа
 * @param abilityModifier Модификатор характеристики заклинаний
 */
export const calculateAvailableSpellsByClassAndLevel = (
  characterClass: string, 
  level: number,
  abilityModifier = 0
): { 
  maxSpellLevel: number; 
  cantripsCount: number; 
  knownSpells: number 
} => {
  const maxSpellLevel = getMaxSpellLevel(characterClass, level);
  const cantripsCount = calculateCantripCount(characterClass, level);
  
  let knownSpells = calculateKnownSpells(characterClass, level);
  
  // Для классов, где количество известных заклинаний зависит от модификатора
  if (['жрец', 'друид', 'cleric', 'druid'].includes(characterClass.toLowerCase())) {
    knownSpells = level + Math.max(1, abilityModifier);
  }
  
  if (['паладин', 'следопыт', 'paladin', 'ranger'].includes(characterClass.toLowerCase()) && level >= 2) {
    knownSpells = Math.ceil(level / 2) + Math.max(1, abilityModifier);
  }
  
  return { maxSpellLevel, cantripsCount, knownSpells };
};

/**
 * Проверяет, сколько заклинаний персонаж может подготовить
 */
export const getPreparedSpellsLimit = (character: Character): number => {
  if (!character || !character.class) return 0;
  
  const className = character.class.toLowerCase();
  let abilityModifier = 0;
  
  // Определяем модификатор способности в зависимости от класса
  if (['жрец', 'друид', 'cleric', 'druid'].includes(className)) {
    // Мудрость
    const wisdom = character.abilities?.wisdom || character.wisdom || 10;
    abilityModifier = Math.floor((wisdom - 10) / 2);
  } else if (['волшебник', 'wizard'].includes(className)) {
    // Интеллект
    const intelligence = character.abilities?.intelligence || character.intelligence || 10;
    abilityModifier = Math.floor((intelligence - 10) / 2);
  } else if (['паладин', 'paladin'].includes(className)) {
    // Харизма
    const charisma = character.abilities?.charisma || character.charisma || 10;
    abilityModifier = Math.floor((charisma - 10) / 2);
  } else {
    // Другие классы не используют подготовку заклинаний
    return 0;
  }
  
  // Формула: уровень класса + модификатор способности
  const level = character.level || 1;
  return Math.max(1, level + abilityModifier);
};

/**
 * Проверяет, может ли персонаж подготовить ещё заклинания
 */
export const canPrepareMoreSpells = (character: Character): boolean => {
  if (!character || !character.spells) return false;
  
  // Подсчитываем количество уже подготовленных заклинаний
  const preparedCount = character.spells.filter(spell => {
    if (typeof spell === 'string') return false;
    return spell.prepared && spell.level > 0; // Заговоры не учитываются
  }).length;
  
  // Получаем максимально возможное количество подготовленных заклинаний
  const limit = getPreparedSpellsLimit(character);
  
  return preparedCount < limit;
};

/**
 * Конвертирует массив CharacterSpell в массив SpellData
 */
export const convertCharacterSpellsToSpellData = (spells: CharacterSpell[]): SpellData[] => {
  return spells.map(spell => convertToSpellData(spell));
};

/**
 * Для преобразования CharacterSpell[] в SpellData[] для типа State
 */
export const convertSpellsForState = (spells: CharacterSpell[]): SpellData[] => {
  return spells.map(spell => ({
    id: spell.id || `spell-${spell.name.replace(/\s+/g, '-').toLowerCase()}`,
    name: spell.name,
    level: spell.level || 0,
    school: spell.school || 'Универсальная',
    castingTime: spell.castingTime || '1 действие',
    range: spell.range || 'На себя',
    components: spell.components || '',
    duration: spell.duration || 'Мгновенная',
    description: spell.description || ['Нет описания'],
    classes: spell.classes || [],
    prepared: spell.prepared || false,
    ritual: spell.ritual || false,
    concentration: spell.concentration || false
  }));
};
