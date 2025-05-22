
import { Character, CharacterSpell } from "@/types/character";
import { SpellData } from "@/types/spells";

// Нормализация списка заклинаний персонажа (преобразование строк в объекты)
export const normalizeSpells = (character: Character): CharacterSpell[] => {
  if (!character.spells || !Array.isArray(character.spells)) return [];
  
  return character.spells.map(spell => {
    // Если заклинание уже является объектом, просто возвращаем его
    if (typeof spell !== 'string') return spell;
    
    // Иначе создаем минимальный объект заклинания
    return {
      name: spell,
      level: 0, // По умолчанию считаем заговором
      prepared: true
    };
  });
};

// Преобразование CharacterSpell в SpellData для отображения
export const convertToSpellData = (spell: CharacterSpell): SpellData => {
  return {
    id: spell.id || `spell-${spell.name.replace(/\s+/g, '-').toLowerCase()}`,
    name: spell.name,
    level: spell.level,
    school: spell.school || 'Универсальная',
    castingTime: spell.castingTime || '1 действие',
    range: spell.range || 'Касание',
    components: spell.components || '',
    duration: spell.duration || 'Мгновенная',
    description: spell.description || '',
    classes: Array.isArray(spell.classes) ? spell.classes : (spell.classes ? [spell.classes] : [])
  };
};

// Расчет доступных заклинаний по классу и уровню персонажа
export const calculateAvailableSpellsByClassAndLevel = (characterClass: string, level: number, abilityModifier = 0) => {
  const lowerClass = characterClass.toLowerCase();
  
  // Максимальный уровень заклинаний
  let maxSpellLevel = 0;
  // Количество известных заговоров
  let cantripsCount = 0;
  // Количество известных или подготовленных заклинаний
  let knownSpells = 0;
  
  // Определение максимального уровня заклинаний и количества известных заклинаний
  // в зависимости от класса и уровня персонажа
  switch (lowerClass) {
    case 'волшебник':
    case 'маг':
      maxSpellLevel = Math.min(9, Math.ceil(level / 2));
      cantripsCount = level < 4 ? 3 : (level < 10 ? 4 : 5);
      knownSpells = level + abilityModifier; // Уровень + модификатор Интеллекта
      break;
      
    case 'жрец':
    case 'друид':
      maxSpellLevel = Math.min(9, Math.ceil(level / 2));
      cantripsCount = level < 4 ? 3 : (level < 10 ? 4 : 5);
      knownSpells = level + abilityModifier; // Уровень + модификатор Мудрости
      break;
      
    case 'бард':
      maxSpellLevel = Math.min(9, Math.ceil(level / 2));
      cantripsCount = level < 4 ? 2 : (level < 10 ? 3 : 4);
      // Количество известных заклинаний для барда
      knownSpells = level === 1 ? 4 : 3 + level;
      break;
      
    case 'чародей':
      maxSpellLevel = Math.min(9, Math.ceil(level / 2));
      cantripsCount = level < 4 ? 4 : (level < 10 ? 5 : 6);
      // Количество известных заклинаний для чародея
      knownSpells = level === 1 ? 2 : 3 + (level - 1);
      break;
      
    case 'колдун':
      maxSpellLevel = Math.min(5, Math.ceil(level / 2));
      cantripsCount = level < 4 ? 2 : (level < 10 ? 3 : 4);
      // Количество известных заклинаний для колдуна
      knownSpells = level === 1 ? 2 : 3 + (level - 1);
      break;
      
    case 'паладин':
    case 'следопыт':
      maxSpellLevel = Math.min(5, Math.ceil((level - 1) / 4)); // Начинает с 2го уровня
      cantripsCount = 0; // У этих классов нет заговоров
      knownSpells = level < 2 ? 0 : Math.ceil(level / 2) + abilityModifier;
      break;
      
    default:
      maxSpellLevel = 0;
      cantripsCount = 0;
      knownSpells = 0;
  }
  
  return {
    maxSpellLevel,
    cantripsCount,
    knownSpells
  };
};

// Получение максимального уровня заклинаний для класса и уровня
export const getMaxSpellLevel = (characterClass: string, level: number): number => {
  const { maxSpellLevel } = calculateAvailableSpellsByClassAndLevel(characterClass, level);
  return maxSpellLevel;
};

// ДОБАВЛЯЕМ НОВЫЕ ФУНКЦИИ:

// Получение модификатора способности для заклинаний в зависимости от класса персонажа
export const getSpellcastingAbilityModifier = (character: Character): number => {
  if (!character || !character.abilities) return 0;
  
  const classLower = character.class ? character.class.toLowerCase() : "";
  
  // Определяем используемую характеристику заклинателя на основе класса
  if (['жрец', 'друид', 'cleric', 'druid'].includes(classLower)) {
    // Мудрость
    return Math.floor((character.abilities.WIS || character.abilities.wisdom || character.wisdom || 10) - 10) / 2;
  } else if (['волшебник', 'маг', 'wizard', 'изобретатель', 'artificer'].includes(classLower)) {
    // Интеллект
    return Math.floor((character.abilities.INT || character.abilities.intelligence || character.intelligence || 10) - 10) / 2;
  } else if (['бард', 'чародей', 'колдун', 'паладин', 'следопыт', 'bard', 'sorcerer', 'warlock', 'paladin', 'ranger'].includes(classLower)) {
    // Харизма (или Харизма/Мудрость для Паладинов и Следопытов)
    return Math.floor((character.abilities.CHA || character.abilities.charisma || character.charisma || 10) - 10) / 2;
  }
  
  return 0;
};

// Фильтрация заклинаний по классу и уровню
export const filterSpellsByClassAndLevel = (spells: SpellData[], characterClass: string, characterLevel: number): SpellData[] => {
  if (!spells || !Array.isArray(spells) || spells.length === 0) return [];
  
  const lowerClass = characterClass.toLowerCase();
  const maxSpellLevel = getMaxSpellLevel(characterClass, characterLevel);
  
  return spells.filter(spell => {
    // Проверяем уровень заклинания
    if (spell.level > maxSpellLevel) return false;
    
    // Проверяем класс заклинания
    if (spell.classes) {
      const classes = Array.isArray(spell.classes) 
        ? spell.classes.map(c => (typeof c === 'string' ? c.toLowerCase() : ''))
        : (typeof spell.classes === 'string' ? [spell.classes.toLowerCase()] : []);
      
      return classes.some(c => c.includes(lowerClass) || lowerClass.includes(c));
    }
    
    return false;
  });
};

// Проверка, может ли персонаж подготовить ещё заклинания
export const canPrepareMoreSpells = (character: Character): boolean => {
  if (!character) return false;
  
  // Получаем лимит подготовленных заклинаний
  const preparedLimit = getPreparedSpellsLimit(character);
  
  // Считаем текущие подготовленные заклинания
  const currentPrepared = character.spells
    ? character.spells.filter(spell => 
        typeof spell !== 'string' && spell.prepared && spell.level > 0
      ).length
    : 0;
  
  return currentPrepared < preparedLimit;
};

// Получение лимита подготовленных заклинаний для персонажа
export const getPreparedSpellsLimit = (character: Character): number => {
  if (!character || !character.class) return 0;
  
  const classLower = character.class.toLowerCase();
  
  // Для классов, которые готовят заклинания
  if (['жрец', 'друид', 'волшебник', 'паладин', 'следопыт', 'изобретатель',
       'cleric', 'druid', 'wizard', 'paladin', 'ranger', 'artificer'].includes(classLower)) {
    
    // Уровень персонажа + модификатор способности
    const abilityMod = getSpellcastingAbilityModifier(character);
    const characterLevel = character.level || 1;
    
    // Для паладинов и следопытов используется половина уровня
    if (['паладин', 'следопыт', 'paladin', 'ranger'].includes(classLower)) {
      return Math.max(1, Math.floor(characterLevel / 2) + abilityMod);
    }
    
    // Для остальных классов используется полный уровень
    return Math.max(1, characterLevel + abilityMod);
  }
  
  // Для классов, которым не нужно готовить заклинания (бард, колдун, чародей)
  return 0;
};
