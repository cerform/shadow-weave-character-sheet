
/**
 * Возвращает числовой модификатор для значения характеристики
 * @param value Значение характеристики (обычно от 1 до 20)
 * @returns Модификатор характеристики
 */
export const getNumericModifier = (value?: number): number => {
  if (!value) return 0;
  return Math.floor((value - 10) / 2);
}

/**
 * Возвращает модификатор для значения характеристики с "+" для положительных значений
 * @param value Значение характеристики (обычно от 1 до 20)
 * @returns Строка с модификатором характеристики (например, "+2" или "-1")
 */
export const getModifierFromAbilityScore = (value?: number): string => {
  if (!value) return "+0";
  const modifier = getNumericModifier(value);
  return modifier >= 0 ? `+${modifier}` : `${modifier}`;
}
