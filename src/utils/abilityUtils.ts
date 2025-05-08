
/**
 * Рассчитывает модификатор характеристики
 * @param score Значение характеристики
 * @returns Модификатор характеристики
 */
export const getAbilityModifier = (score?: number): number => {
  if (!score) return 0;
  return Math.floor((score - 10) / 2);
};

/**
 * Рассчитывает модификатор характеристики персонажа
 * @param character Персонаж
 * @param ability Название характеристики
 * @returns Модификатор характеристики
 */
export const getCharacterAbilityModifier = (character: any, ability: string): number => {
  if (!character || !ability) return 0;
  
  // Проверяем наличие значения в разных местах
  const score = character.abilities?.[ability] || 
               character.stats?.[ability] || 
               character[ability] || 
               10;
  
  return getAbilityModifier(score);
};

/**
 * Возвращает строковое представление модификатора характеристики
 * @param score Значение характеристики
 * @returns Строка с модификатором (например, "+3" или "-1")
 */
export const getAbilityModifierString = (score?: number): string => {
  if (!score) return "+0";
  
  const modifier = getAbilityModifier(score);
  return modifier >= 0 ? `+${modifier}` : `${modifier}`;
};

/**
 * Рассчитывает бонус мастерства на основе уровня персонажа
 * @param level Уровень персонажа
 * @returns Бонус мастерства
 */
export const getProficiencyBonus = (level: number = 1): number => {
  return Math.floor((level - 1) / 4) + 2;
};
