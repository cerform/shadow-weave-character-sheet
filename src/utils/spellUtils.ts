
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
