
import { Character } from '@/types/character';
import { CharacterSpell } from '@/types/spells';

/**
 * Получает максимальный уровень заклинаний, который персонаж может использовать
 */
export const getMaxSpellLevel = (character: Character): number => {
  const { level } = character;
  
  if (level <= 2) return 1;
  if (level <= 4) return 2;
  if (level <= 6) return 3;
  if (level <= 8) return 4;
  if (level <= 10) return 5;
  if (level <= 12) return 6;
  if (level <= 14) return 7;
  if (level <= 16) return 8;
  return 9;
};

/**
 * Определяет лимит подготовленных заклинаний для персонажа
 */
export const getPreparedSpellsLimit = (character: Character): number => {
  const spellAbility = getSpellcastingAbility(character);
  const abilityValue = character.abilities?.[spellAbility] || 10;
  const abilityMod = Math.floor((abilityValue - 10) / 2);
  
  return Math.max(1, abilityMod + character.level);
};

/**
 * Проверяет, может ли персонаж подготовить еще заклинания
 */
export const canPrepareMoreSpells = (character: Character): boolean => {
  const preparedCount = (character.spells || [])
    .filter(spell => typeof spell === 'object' && spell.prepared)
    .length;
  
  return preparedCount < getPreparedSpellsLimit(character);
};

/**
 * Определяет основную характеристику для заклинаний персонажа
 */
export const getSpellcastingAbility = (character: Character): string => {
  const { class: characterClass } = character;
  
  switch (characterClass?.toLowerCase()) {
    case 'wizard':
    case 'artificer':
      return 'intelligence';
    case 'cleric':
    case 'druid':
    case 'ranger':
      return 'wisdom';
    case 'bard':
    case 'paladin':
    case 'sorcerer':
    case 'warlock':
      return 'charisma';
    default:
      return 'intelligence';
  }
};

/**
 * Безопасно конвертирует описание заклинания
 */
export const safelyConvertSpellDescription = (description: string | undefined): string => {
  if (!description) return '';
  return description.replace(/"/g, '&quot;');
};

/**
 * Безопасно конвертирует классы заклинания
 */
export const safelyConvertSpellClasses = (classes: string | string[] | undefined): string => {
  if (!classes) return '';
  if (typeof classes === 'string') return classes;
  return classes.join(', ');
};

/**
 * Рассчитывает доступные заклинания по классу и уровню
 */
export const calculateAvailableSpellsByClassAndLevel = (
  characterClass: string, 
  level: number
): { maxLevel: number; cantripsCount: number; knownSpells: number; maxSpellLevel: number } => {
  // Значения по умолчанию
  let cantripsCount = 0;
  let knownSpells = 0;
  let maxLevel = 0;

  // Определяем максимальный уровень заклинания
  if (level >= 1) maxLevel = 1;
  if (level >= 3) maxLevel = 2;
  if (level >= 5) maxLevel = 3;
  if (level >= 7) maxLevel = 4;
  if (level >= 9) maxLevel = 5;
  if (level >= 11) maxLevel = 6;
  if (level >= 13) maxLevel = 7;
  if (level >= 15) maxLevel = 8;
  if (level >= 17) maxLevel = 9;

  // Расчет в зависимости от класса
  switch (characterClass.toLowerCase()) {
    case 'волшебник':
    case 'wizard':
      cantripsCount = level < 4 ? 3 : (level < 10 ? 4 : 5);
      knownSpells = level < 2 ? 6 : 6 + (level - 1) * 2;
      break;
    case 'чародей':
    case 'sorcerer':
      cantripsCount = level < 4 ? 4 : (level < 10 ? 5 : 6);
      knownSpells = level + 1;
      break;
    case 'бард':
    case 'bard':
      cantripsCount = level < 4 ? 2 : (level < 10 ? 3 : 4);
      knownSpells = level < 2 ? 4 : 4 + Math.ceil(level / 2) - 1;
      break;
    case 'колдун':
    case 'warlock':
      cantripsCount = level < 4 ? 2 : (level < 10 ? 3 : 4);
      knownSpells = level + 1;
      break;
    case 'жрец':
    case 'клерик':
    case 'cleric':
      cantripsCount = level < 4 ? 3 : (level < 10 ? 4 : 5);
      knownSpells = level + 1; // Мод мудрости + уровень
      break;
    case 'друид':
    case 'druid':
      cantripsCount = level < 4 ? 2 : (level < 10 ? 3 : 4);
      knownSpells = level + 1; // Мод мудрости + уровень
      break;
    case 'паладин':
    case 'paladin':
      if (level >= 2) {
        knownSpells = Math.ceil(level / 2) + 1; // Мод харизмы + половина уровня
        maxLevel = Math.min(Math.ceil(level / 2), 5);
      }
      break;
    case 'следопыт':
    case 'ranger':
      if (level >= 2) {
        knownSpells = Math.ceil(level / 2) + 1; // Мод мудрости + половина уровня
        maxLevel = Math.min(Math.ceil(level / 2), 5);
      }
      break;
    default:
      break;
  }

  return { maxLevel, cantripsCount, knownSpells, maxSpellLevel: maxLevel };
};

/**
 * Тип заклинания для CharacterSpell
 */
export interface CharacterSpellType extends CharacterSpell {
  verbal?: boolean;
  somatic?: boolean;
  material?: boolean;
}

/**
 * Обновляет статус подготовки заклинания
 */
export const toggleSpellPreparation = (spell: CharacterSpell | string): CharacterSpell => {
  if (typeof spell === 'string') {
    return { name: spell, prepared: true, level: 0 };
  }
  
  return {
    ...spell,
    prepared: !spell.prepared
  };
};
