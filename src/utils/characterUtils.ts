/**
 * Вычисляет модификатор способности на основе значения
 */
export const calculateAbilityModifier = (abilityScore: number): number => {
  return Math.floor((abilityScore - 10) / 2);
};

/**
 * Альтернативное название для той же функции (для обратной совместимости)
 */
export const getAbilityModifier = calculateAbilityModifier;

/**
 * Получает числовой модификатор для способности (ещё один альтернативный вариант)
 */
export const getNumericModifier = calculateAbilityModifier;

/**
 * Рассчитывает бонус мастерства по уровню персонажа
 */
export const calculateProficiencyBonus = (level: number): number => {
  return Math.floor((level - 1) / 4) + 2;
};
