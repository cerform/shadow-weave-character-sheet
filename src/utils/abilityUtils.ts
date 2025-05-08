
/**
 * Вычисляет значение модификатора характеристики
 * @param score Значение характеристики
 * @returns Значение модификатора
 */
export const getAbilityModifierValue = (score: number): number => {
  return Math.floor((score - 10) / 2);
};

/**
 * Вычисляет модификатор характеристики и возвращает его со знаком
 * @param score Значение характеристики
 * @returns Модификатор со знаком (например, "+3" или "-1")
 */
export const getAbilityModifier = (score: number): string => {
  const mod = getAbilityModifierValue(score);
  return mod >= 0 ? `+${mod}` : `${mod}`;
};

/**
 * Синоним для getAbilityModifier для совместимости с существующим кодом
 * @param score Значение характеристики
 * @returns Модификатор со знаком (например, "+3" или "-1")
 */
export const getAbilityModifierString = (score: number): string => {
  return getAbilityModifier(score);
};

/**
 * Проверяет, владеет ли персонаж спасброском
 * @param character Персонаж
 * @param ability Характеристика
 * @returns true, если персонаж владеет спасброском
 */
export const hasSavingThrowProficiency = (character: any, ability: string): boolean => {
  if (!character) return false;
  
  if (character.savingThrows && character.savingThrows[ability]) {
    return true;
  }
  
  if (character.savingThrowProficiencies && Array.isArray(character.savingThrowProficiencies)) {
    return character.savingThrowProficiencies.includes(ability);
  }
  
  return false;
};
