
/**
 * Утилиты для работы с характеристиками персонажей
 */

/**
 * Вычисляет модификатор характеристики по её значению
 * @param score Значение характеристики
 * @returns Строка модификатора (например, "+3" или "-1")
 */
export const getAbilityModifier = (score: number): string => {
  const modifier = Math.floor((score - 10) / 2);
  return modifier >= 0 ? `+${modifier}` : `${modifier}`;
};

/**
 * Вычисляет модификатор характеристики как число
 * @param score Значение характеристики
 * @returns Числовое значение модификатора
 */
export const getAbilityModifierValue = (score: number): number => {
  return Math.floor((score - 10) / 2);
};

/**
 * Получает значение характеристики из объекта abilities или stats
 * @param character Персонаж
 * @param abilityKey Ключ характеристики (strength, STR и т.д.)
 * @returns Значение характеристики или 10 по умолчанию
 */
export const getAbilityScore = (character: any, abilityKey: string): number => {
  if (!character) return 10;
  
  // Проверяем короткие имена в abilities
  if (character.abilities) {
    if (character.abilities[abilityKey]) {
      return character.abilities[abilityKey];
    }
    
    // Преобразуем длинные имена в короткие
    const shortNames: Record<string, string> = {
      'strength': 'STR',
      'dexterity': 'DEX', 
      'constitution': 'CON',
      'intelligence': 'INT',
      'wisdom': 'WIS',
      'charisma': 'CHA'
    };
    
    // Преобразуем короткие имена в длинные
    const longNames: Record<string, string> = {
      'STR': 'strength',
      'DEX': 'dexterity',
      'CON': 'constitution',
      'INT': 'intelligence',
      'WIS': 'wisdom',
      'CHA': 'charisma'
    };
    
    // Проверяем по альтернативному имени
    if (shortNames[abilityKey] && character.abilities[shortNames[abilityKey]]) {
      return character.abilities[shortNames[abilityKey]];
    }
    
    if (longNames[abilityKey] && character.abilities[longNames[abilityKey]]) {
      return character.abilities[longNames[abilityKey]];
    }
  }
  
  // Проверяем в stats
  if (character.stats && character.stats[abilityKey]) {
    return character.stats[abilityKey];
  }
  
  // Проверяем прямо в character
  if (character[abilityKey]) {
    return character[abilityKey];
  }
  
  // Значение по умолчанию
  return 10;
};

/**
 * Получает модификатор характеристики персонажа
 * @param character Персонаж
 * @param abilityKey Ключ характеристики
 * @returns Строка модификатора (например, "+3" или "-1")
 */
export const getCharacterAbilityModifier = (character: any, abilityKey: string): string => {
  const score = getAbilityScore(character, abilityKey);
  return getAbilityModifier(score);
};
