
import { Character } from '@/types/character';

/**
 * Вычисляет модификатор характеристики по ее значению
 * @param abilityScore Значение характеристики
 * @returns Модификатор характеристики
 */
export function getAbilityModifierValue(abilityScore: number): number {
  return Math.floor((abilityScore - 10) / 2);
}

/**
 * Форматирует модификатор характеристики со знаком + или -
 * @param modifier Числовой модификатор
 * @returns Строка с модификатором (например, "+3" или "-1")
 */
export function formatAbilityModifier(modifier: number): string {
  return modifier >= 0 ? `+${modifier}` : `${modifier}`;
}

/**
 * Получает значение характеристики персонажа с учетом разных форматов данных
 * @param character Объект персонажа
 * @param ability Название характеристики на английском (strength, dexterity, etc.)
 * @returns Значение характеристики
 */
export function getAbilityValue(character: Character, ability: string): number {
  if (!character) return 10;
  
  // Проверяем наличие характеристики в разных местах с учетом регистра
  if (character[ability as keyof Character] !== undefined) {
    return character[ability as keyof Character] as number;
  }
  
  // Проверяем в abilities
  if (character.abilities && character.abilities[ability as keyof typeof character.abilities] !== undefined) {
    return character.abilities[ability as keyof typeof character.abilities];
  }
  
  // Проверяем в stats
  if (character.stats && character.stats[ability as keyof typeof character.stats] !== undefined) {
    return character.stats[ability as keyof typeof character.stats];
  }
  
  // Проверяем аббревиатуры в abilities (STR, DEX и т.д.)
  const abbrev = ability.substring(0, 3).toUpperCase();
  if (character.abilities && character.abilities[abbrev as keyof typeof character.abilities] !== undefined) {
    return character.abilities[abbrev as keyof typeof character.abilities];
  }
  
  return 10; // Значение по умолчанию, если ничего не найдено
}

/**
 * Получает модификатор характеристики персонажа
 * @param character Объект персонажа
 * @param ability Название характеристики на английском
 * @returns Модификатор характеристики
 */
export function getAbilityModifier(character: Character, ability: string): number {
  const abilityValue = getAbilityValue(character, ability);
  return getAbilityModifierValue(abilityValue);
}

/**
 * Получает форматированный модификатор характеристики персонажа
 * @param character Объект персонажа
 * @param ability Название характеристики на английском
 * @returns Форматированный модификатор характеристики
 */
export function getFormattedAbilityModifier(character: Character, ability: string): string {
  const modifier = getAbilityModifier(character, ability);
  return formatAbilityModifier(modifier);
}

