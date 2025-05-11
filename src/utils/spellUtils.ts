
import { Character, CharacterSpell } from '@/types/character';
import { SpellData } from '@/types/spells';
import { getAbilityModifier } from './characterUtils';

// Функция для определения базовой характеристики заклинаний на основе класса
export const getDefaultCastingAbility = (characterClass: string | undefined): string => {
  if (!characterClass) return 'intelligence';
  
  const classLower = characterClass.toLowerCase();
  
  // Классы, использующие Интеллект
  if (['волшебник', 'wizard', 'artificer', 'изобретатель'].includes(classLower)) {
    return 'intelligence';
  }
  
  // Классы, использующие Мудрость
  if (['жрец', 'cleric', 'друид', 'druid', 'следопыт', 'ranger', 'монах', 'monk'].includes(classLower)) {
    return 'wisdom';
  }
  
  // Классы, использующие Харизму (все остальные заклинатели)
  if (['бард', 'bard', 'колдун', 'warlock', 'чародей', 'sorcerer', 'паладин', 'paladin'].includes(classLower)) {
    return 'charisma';
  }
  
  // По умолчанию возвращаем интеллект
  return 'intelligence';
};

// Функция для расчета СЛ спасбросков от заклинаний
export const calculateSpellSaveDC = (character: Character): number => {
  if (!character || !character.spellcasting) return 8;
  
  // Определяем базовую характеристику для заклинаний
  const ability = character.spellcasting.ability || getDefaultCastingAbility(character.class);
  
  // Получаем значение характеристики
  const abilityValue = getAbilityValue(character, ability);
  
  // Рассчитываем модификатор
  const abilityMod = getAbilityModifier(abilityValue);
  
  // Получаем бонус мастерства
  const proficiencyBonus = character.proficiencyBonus || 2;
  
  // Формула СЛ: 8 + модификатор характеристики + бонус мастерства
  return 8 + abilityMod + proficiencyBonus;
};

// Псевдоним для обратной совместимости
export const calculateSpellcastingDC = calculateSpellSaveDC;

// Функция для расчета бонуса атаки заклинанием
export const calculateSpellAttackBonus = (character: Character): number => {
  if (!character || !character.spellcasting) return 0;
  
  // Определяем базовую характеристику для заклинаний
  const ability = character.spellcasting.ability || getDefaultCastingAbility(character.class);
  
  // Получаем значение характеристики
  const abilityValue = getAbilityValue(character, ability);
  
  // Рассчитываем модификатор
  const abilityMod = getAbilityModifier(abilityValue);
  
  // Получаем бонус мастерства
  const proficiencyBonus = character.proficiencyBonus || 2;
  
  // Формула бонуса атаки: модификатор характеристики + бонус мастерства
  return abilityMod + proficiencyBonus;
};

// Вспомогательная функция для получения значения характеристики
const getAbilityValue = (character: Character, abilityKey: string): number => {
  if (!character) return 10;
  
  // Преобразуем ключ характеристики к нижнему регистру
  const key = abilityKey.toLowerCase();
  
  // Проверяем все возможные пути к значению характеристики
  if (key === 'strength' || key === 'сила' || key === 'str') {
    return character.abilities?.STR || character.abilities?.strength || character.strength || 10;
  } else if (key === 'dexterity' || key === 'ловкость' || key === 'dex') {
    return character.abilities?.DEX || character.abilities?.dexterity || character.dexterity || 10;
  } else if (key === 'constitution' || key === 'телосложение' || key === 'con') {
    return character.abilities?.CON || character.abilities?.constitution || character.constitution || 10;
  } else if (key === 'intelligence' || key === 'интеллект' || key === 'int') {
    return character.abilities?.INT || character.abilities?.intelligence || character.intelligence || 10;
  } else if (key === 'wisdom' || key === 'мудрость' || key === 'wis') {
    return character.abilities?.WIS || character.abilities?.wisdom || character.wisdom || 10;
  } else if (key === 'charisma' || key === 'харизма' || key === 'cha') {
    return character.abilities?.CHA || character.abilities?.charisma || character.charisma || 10;
  }
  
  // Если не нашли соответствия, возвращаем значение по умолчанию
  return 10;
};

// Проверка, может ли персонаж подготовить еще заклинания
export const canPrepareMoreSpells = (
  character: Character,
  currentPrepared: number
): boolean => {
  const limit = getPreparedSpellsLimit(character);
  return currentPrepared < limit;
};

// Получение лимита подготовленных заклинаний
export const getPreparedSpellsLimit = (character: Character): number => {
  if (!character) return 0;
  
  const { level = 1, class: className = '' } = character;
  
  // Определяем базовую характеристику для заклинаний
  const ability = character.spellcasting?.ability || getDefaultCastingAbility(className);
  
  // Получаем значение характеристики
  const abilityValue = getAbilityValue(character, ability);
  
  // Рассчитываем модификатор
  const abilityMod = getAbilityModifier(abilityValue);
  
  // Для большинства классов формула: уровень класса + модификатор характеристики
  // Колдуны и чароди имеют фиксированное количество известных заклинаний
  const classLower = className.toLowerCase();
  
  if (['жрец', 'cleric', 'друид', 'druid', 'паладин', 'paladin', 'искусный', 'artificer'].includes(classLower)) {
    return Math.max(1, level + abilityMod);
  } else if (['волшебник', 'wizard'].includes(classLower)) {
    // Волшебники имеют специальную формулу: 6 + (2 * уровень)
    return 6 + (2 * level);
  }
  
  // Для классов с фиксированным количеством заклинаний возвращаем 0
  // (они не готовят заклинания, у них есть известные заклинания)
  return 0;
};

// Конвертация объекта CharacterSpell в SpellData
export const convertToSpellData = (spell: CharacterSpell): SpellData => {
  return {
    id: spell.id || `spell-${spell.name.replace(/\s+/g, '-').toLowerCase()}`,
    name: spell.name,
    level: spell.level,
    school: spell.school || 'Универсальная',
    castingTime: spell.castingTime || '1 действие',
    range: spell.range || 'На себя',
    components: spell.components || '',
    duration: spell.duration || 'Мгновенная',
    description: spell.description || '',
    classes: spell.classes || [],
    verbal: spell.verbal,
    somatic: spell.somatic,
    material: spell.material,
    ritual: spell.ritual,
    concentration: spell.concentration,
    prepared: spell.prepared
  };
};

// Расчет доступных заклинаний в зависимости от класса и уровня
export const calculateAvailableSpellsByClassAndLevel = (
  characterClass: string,
  level: number,
  abilityModifier: number = 0
) => {
  // Значения по умолчанию
  let cantripsCount = 0;
  let knownSpells = 0;
  let maxSpellLevel = 0;

  // Определение максимального уровня заклинаний
  if (level >= 17) maxSpellLevel = 9;
  else if (level >= 15) maxSpellLevel = 8;
  else if (level >= 13) maxSpellLevel = 7;
  else if (level >= 11) maxSpellLevel = 6;
  else if (level >= 9) maxSpellLevel = 5;
  else if (level >= 7) maxSpellLevel = 4;
  else if (level >= 5) maxSpellLevel = 3;
  else if (level >= 3) maxSpellLevel = 2;
  else if (level >= 1) maxSpellLevel = 1;

  const classLower = characterClass.toLowerCase();
  
  // Настройки заклинаний в зависимости от класса
  switch (classLower) {
    case 'волшебник':
    case 'wizard':
      cantripsCount = level >= 10 ? 5 : level >= 4 ? 4 : 3;
      knownSpells = 6 + (level * 2); // Начиная с 6, +2 за каждый уровень
      break;
    case 'жрец':
    case 'cleric':
    case 'друид':
    case 'druid':
      cantripsCount = level >= 10 ? 5 : level >= 4 ? 4 : 3;
      knownSpells = level + abilityModifier; // Уровень + модификатор характеристики
      break;
    case 'бард':
    case 'bard':
      cantripsCount = level >= 10 ? 4 : 2;
      knownSpells = Math.max(4, level + 3); // Начинается с 4, увеличивается с уровнем
      break;
    case 'колдун':
    case 'warlock':
      cantripsCount = level >= 10 ? 4 : 2;
      knownSpells = Math.min(15, level + 1); // Начинается с 2, увеличивается с уровнем, макс 15
      break;
    case 'чародей':
    case 'sorcerer':
      cantripsCount = level >= 10 ? 6 : level >= 4 ? 5 : 4;
      knownSpells = level + 1; // Начинается с 2, увеличивается с уровнем
      break;
    default:
      cantripsCount = 0;
      knownSpells = 0;
  }

  return { cantripsCount, knownSpells, maxSpellLevel };
};

// Преобразуем CharacterSpell[] в правильный формат для состояния
export const convertSpellsForState = (spells: CharacterSpell[]): CharacterSpell[] => {
  return spells.map(spell => ({
    ...spell,
    id: spell.id || `spell-${spell.name.toLowerCase().replace(/\s+/g, '-')}`
  }));
};
