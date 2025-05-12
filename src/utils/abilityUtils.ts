
/**
 * Вычисляет модификатор характеристики по её значению
 * @param abilityScore значение характеристики
 * @returns модификатор характеристики
 */
export const calculateModifier = (abilityScore: number): number => {
  return Math.floor((abilityScore - 10) / 2);
};

/**
 * Возвращает строковое представление модификатора характеристики со знаком
 * @param abilityScore значение характеристики
 * @returns строковое представление модификатора (например "+3" или "-1")
 */
export const getAbilityModifierString = (abilityScore: number | undefined): string => {
  if (abilityScore === undefined) return '';
  const modifier = calculateModifier(abilityScore);
  return modifier >= 0 ? `+${modifier}` : `${modifier}`;
};
