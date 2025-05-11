
import { Character, CharacterSpell } from '@/types/character';
import { SpellData } from '@/types/spells';
import { slugify } from './stringUtils';

/**
 * Определяет базовую характеристику для заклинаний класса
 */
export const getDefaultCastingAbility = (characterClass: string): 'intelligence' | 'wisdom' | 'charisma' => {
  const classLower = characterClass?.toLowerCase() || '';
  
  if (['волшебник', 'wizard', 'artificer', 'артифайсер'].includes(classLower)) {
    return 'intelligence';
  } else if (['жрец', 'cleric', 'друид', 'druid', 'следопыт', 'ranger'].includes(classLower)) {
    return 'wisdom';
  } else if (['бард', 'bard', 'чародей', 'sorcerer', 'колдун', 'warlock', 'паладин', 'paladin'].includes(classLower)) {
    return 'charisma';
  }
  
  // По умолчанию интеллект
  return 'intelligence';
};

/**
 * Рассчитывает модификатор базовой характеристики заклинаний
 */
export const getSpellcastingAbilityModifier = (character: Character): number => {
  const ability = getDefaultCastingAbility(character.class);
  
  if (ability === 'intelligence') {
    return Math.floor((Number(character.abilities.INT || character.abilities.intelligence) - 10) / 2);
  } else if (ability === 'wisdom') {
    return Math.floor((Number(character.abilities.WIS || character.abilities.wisdom) - 10) / 2);
  } else {
    return Math.floor((Number(character.abilities.CHA || character.abilities.charisma) - 10) / 2);
  }
};

/**
 * Рассчитывает СЛ спасброска от заклинаний
 */
export const calculateSpellSaveDC = (character: Character): number => {
  const abilityMod = getSpellcastingAbilityModifier(character);
  return 8 + abilityMod + (character.proficiencyBonus || 2);
};

/**
 * Рассчитывает бонус атаки заклинанием
 */
export const calculateSpellAttackBonus = (character: Character): number => {
  const abilityMod = getSpellcastingAbilityModifier(character);
  return abilityMod + (character.proficiencyBonus || 2);
};

/**
 * Нормализует список заклинаний персонажа
 */
export const normalizeSpells = (spells: any[] | undefined): CharacterSpell[] => {
  if (!spells || !Array.isArray(spells)) return [];
  
  return spells.map(spell => {
    if (typeof spell === 'string') {
      return {
        id: `spell-${slugify(spell)}`,
        name: spell,
        level: 0,
        school: 'Универсальная'
      };
    } else if (typeof spell === 'object' && spell !== null) {
      return {
        ...spell,
        id: spell.id || `spell-${slugify(spell.name)}`,
        school: spell.school || 'Универсальная'
      };
    }
    
    // Если элемент не строка и не объект, возвращаем заглушку
    return {
      id: `spell-unknown-${Math.random().toString(36).substring(2, 9)}`,
      name: 'Неизвестное заклинание',
      level: 0,
      school: 'Универсальная'
    };
  });
};

/**
 * Проверяет, может ли персонаж подготовить еще заклинания
 */
export const canPrepareMoreSpells = (character: Character): boolean => {
  if (!character.spells) return true;
  
  const preparedSpells = normalizeSpells(character.spells).filter(spell => spell.prepared);
  const limit = getPreparedSpellsLimit(character);
  
  return preparedSpells.length < limit;
};

/**
 * Определяет максимальный уровень доступных заклинаний
 */
export const getMaxSpellLevel = (character: Character): number => {
  const level = character.level || 1;
  
  if (level === 1) return 1;
  if (level < 5) return 2;
  if (level < 9) return 3;
  if (level < 13) return 4;
  if (level < 17) return 5;
  if (level < 19) return 6;
  return 7; // 19-20 уровень
};

/**
 * Определяет максимальное количество подготовленных заклинаний
 */
export const getPreparedSpellsLimit = (character: Character): number => {
  const spellAbility = getDefaultCastingAbility(character.class);
  let abilityMod = 0;
  
  if (spellAbility === 'intelligence') {
    abilityMod = Math.floor((Number(character.abilities.INT || character.abilities.intelligence) - 10) / 2);
  } else if (spellAbility === 'wisdom') {
    abilityMod = Math.floor((Number(character.abilities.WIS || character.abilities.wisdom) - 10) / 2);
  } else if (spellAbility === 'charisma') {
    abilityMod = Math.floor((Number(character.abilities.CHA || character.abilities.charisma) - 10) / 2);
  }
  
  return Math.max(1, abilityMod + (character.level || 1));
};

/**
 * Фильтрует заклинания по классу и уровню
 */
export const filterSpellsByClassAndLevel = (allSpells: CharacterSpell[], characterClass: string, maxLevel: number): CharacterSpell[] => {
  const classLower = characterClass?.toLowerCase() || '';
  
  return allSpells.filter(spell => {
    // Проверка уровня заклинания
    if (spell.level > maxLevel) return false;
    
    // Проверка класса
    if (!spell.classes || !Array.isArray(spell.classes)) return false;
    
    return spell.classes.some(spellClass => 
      spellClass.toLowerCase() === classLower
    );
  });
};

/**
 * Преобразует CharacterSpell в SpellData
 */
export const convertToSpellData = (spell: CharacterSpell | string): SpellData => {
  if (typeof spell === 'string') {
    return {
      id: `spell-${slugify(spell)}`,
      name: spell,
      level: 0,
      school: 'Универсальная',
      castingTime: '1 действие',
      range: 'На себя',
      components: '',
      duration: 'Мгновенная',
      description: ''
    };
  }
  
  return {
    id: spell.id || `spell-${slugify(spell.name)}`,
    name: spell.name,
    level: spell.level || 0,
    school: spell.school || 'Универсальная',
    castingTime: spell.castingTime || '1 действие',
    range: spell.range || 'На себя',
    components: spell.components || '',
    duration: spell.duration || 'Мгновенная',
    description: spell.description || '',
    classes: spell.classes,
    prepared: spell.prepared,
    verbal: spell.verbal,
    somatic: spell.somatic,
    material: spell.material,
    ritual: spell.ritual,
    concentration: spell.concentration,
    materials: spell.materials,
    source: spell.source
  };
};

/**
 * Преобразует SpellData в CharacterSpell
 */
export const convertSpellDataToCharacterSpell = (spellData: SpellData): CharacterSpell => {
  return {
    id: spellData.id,
    name: spellData.name,
    level: spellData.level,
    school: spellData.school,
    castingTime: spellData.castingTime,
    range: spellData.range,
    components: spellData.components,
    duration: spellData.duration,
    description: spellData.description,
    prepared: spellData.prepared || false,
    ritual: spellData.ritual,
    concentration: spellData.concentration,
    verbal: spellData.verbal,
    somatic: spellData.somatic,
    material: spellData.material,
    materials: spellData.materials,
    classes: spellData.classes,
    source: spellData.source
  };
};

/**
 * Преобразует массив CharacterSpell в массив SpellData
 */
export const convertSpellsForState = (spells: CharacterSpell[]): SpellData[] => {
  return spells.map(spell => convertToSpellData(spell));
};

/**
 * Вычисляет доступные заклинания в зависимости от класса и уровня
 */
export const calculateAvailableSpellsByClassAndLevel = (
  characterClass: string, 
  level: number,
  abilityModifier = 0
): { maxSpellLevel: number, cantripsCount: number, knownSpells: number } => {
  // Значения по умолчанию
  let maxSpellLevel = 0;
  let cantripsCount = 0;
  let knownSpells = 0;
  
  const classLower = characterClass?.toLowerCase() || '';
  
  // Максимальный уровень заклинаний
  if (level >= 1 && level <= 2) maxSpellLevel = 1;
  else if (level >= 3 && level <= 4) maxSpellLevel = 2;
  else if (level >= 5 && level <= 8) maxSpellLevel = 3;
  else if (level >= 9 && level <= 12) maxSpellLevel = 4;
  else if (level >= 13 && level <= 16) maxSpellLevel = 5;
  else if (level >= 17 && level <= 18) maxSpellLevel = 6;
  else if (level >= 19) maxSpellLevel = 7;
  
  // Количество заговоров и известных заклинаний по классам
  switch (classLower) {
    case 'волшебник':
    case 'wizard':
      cantripsCount = level >= 10 ? 5 : level >= 4 ? 4 : 3;
      knownSpells = 6 + (level * 2); // Стартовая книга заклинаний
      break;
      
    case 'жрец':
    case 'cleric':
    case 'друид':
    case 'druid':
      cantripsCount = level >= 10 ? 5 : level >= 4 ? 4 : 3;
      knownSpells = level + Math.max(1, abilityModifier); // Уровень + модификатор характеристики
      break;
      
    case 'бард':
    case 'bard':
      cantripsCount = level >= 10 ? 4 : 2;
      knownSpells = Math.max(4, level + 3); // Таблица из книги игрока
      break;
      
    case 'чародей':
    case 'sorcerer':
      cantripsCount = level >= 10 ? 6 : level >= 4 ? 5 : 4;
      knownSpells = level + 1; // Таблица из книги игрока
      break;
      
    case 'колдун':
    case 'warlock':
      cantripsCount = level >= 10 ? 4 : 2;
      knownSpells = Math.min(15, level + 1); // Таблица из книги игрока, максимум 15
      break;
      
    case 'следопыт':
    case 'ranger':
      cantripsCount = 0; // По умолчанию у следопыта нет заговоров
      knownSpells = Math.floor((level + 1) / 2); // Половина от уровня, округлённая вверх
      break;
      
    case 'паладин':
    case 'paladin':
      cantripsCount = 0; // По умолчанию у паладина нет заговоров
      knownSpells = Math.floor((level + 1) / 2); // Половина от уровня, округлённая вверх
      break;
      
    default:
      cantripsCount = 0;
      knownSpells = 0;
  }
  
  return { maxSpellLevel, cantripsCount, knownSpells };
};
