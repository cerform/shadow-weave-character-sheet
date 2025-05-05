
/**
 * Рассчитывает числовой модификатор для значения характеристики
 * @param score Значение характеристики
 * @returns Модификатор
 */
export const getNumericModifier = (score: number): number => {
  return Math.floor((score - 10) / 2);
};

/**
 * Форматирует модификатор в строку со знаком + или -
 * @param modifier Числовой модификатор
 * @returns Строка модификатора (например, "+2" или "-1")
 */
export const formatModifier = (modifier: number): string => {
  return modifier >= 0 ? `+${modifier}` : `${modifier}`;
};

/**
 * Рассчитывает модификатор для значения характеристики и форматирует его в строку
 * @param score Значение характеристики
 * @returns Строка модификатора (например, "+2" или "-1")
 */
export const getModifier = (score: number): string => {
  return formatModifier(getNumericModifier(score));
};
