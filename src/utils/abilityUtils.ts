
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

/**
 * Возвращает полное название характеристики
 * @param shortName краткое название характеристики
 * @returns полное название характеристики
 */
export const getAbilityNameFull = (shortName: string): string => {
  const abilityNames: Record<string, string> = {
    'STR': 'Сила',
    'DEX': 'Ловкость',
    'CON': 'Телосложение',
    'INT': 'Интеллект',
    'WIS': 'Мудрость',
    'CHA': 'Харизма',
    'strength': 'Сила',
    'dexterity': 'Ловкость',
    'constitution': 'Телосложение',
    'intelligence': 'Интеллект',
    'wisdom': 'Мудрость',
    'charisma': 'Харизма'
  };

  return abilityNames[shortName] || shortName;
};

/**
 * Получает значение характеристики из объекта персонажа по ее названию
 * @param character объект персонажа
 * @param abilityName название характеристики
 * @returns значение характеристики
 */
export const getAbilityScore = (character: any, abilityName: string): number => {
  if (!character) return 10;
  
  const abilityKey = abilityName.toLowerCase() as keyof typeof character;
  
  // Проверяем прямой доступ к св-ву
  if (typeof character[abilityKey] === 'number') {
    return character[abilityKey] as number;
  }
  
  // Проверяем abilities
  if (character.abilities && typeof character.abilities[abilityKey] === 'number') {
    return character.abilities[abilityKey] as number;
  }
  
  // Проверяем stats
  if (character.stats && typeof character.stats[abilityKey] === 'number') {
    return character.stats[abilityKey] as number;
  }
  
  return 10; // Значение по умолчанию
};

