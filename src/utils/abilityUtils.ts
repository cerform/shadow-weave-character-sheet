
/**
 * Вычисляет модификатор характеристики на основе значения
 * @param score Значение характеристики
 * @returns модификатор характеристики
 */
export function getAbilityModifierValue(score: number | undefined): number {
  if (score === undefined) return 0;
  return Math.floor((score - 10) / 2);
}

/**
 * Возвращает строковое представление модификатора с плюсом или минусом
 * @param score Значение характеристики
 * @returns Строка вида "+2" или "-1"
 */
export function getAbilityModifierString(score: number | undefined): string {
  if (score === undefined) return "+0";
  const modifier = getAbilityModifierValue(score);
  return modifier >= 0 ? `+${modifier}` : `${modifier}`;
}

/**
 * Вычисляет бонус мастерства на основе уровня
 * @param level Уровень персонажа
 * @returns бонус мастерства
 */
export function getProficiencyBonus(level: number): number {
  return Math.floor((level - 1) / 4) + 2;
}
