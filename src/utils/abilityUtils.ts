
/**
 * Расчёт модификатора характеристики
 */
export const getAbilityModifier = (abilityScore: number): number => {
  return Math.floor((abilityScore - 10) / 2);
};

/**
 * Получение строкового представления модификатора характеристики (+X или -X)
 */
export const getAbilityModifierString = (abilityScore: number): string => {
  const modifier = getAbilityModifier(abilityScore);
  return modifier >= 0 ? `+${modifier}` : `${modifier}`;
};

/**
 * Получение названия характеристики
 */
export const getAbilityName = (ability: string): string => {
  const abilityMap: Record<string, string> = {
    'STR': 'СИЛ',
    'DEX': 'ЛОВ',
    'CON': 'ВЫН',
    'INT': 'ИНТ',
    'WIS': 'МДР',
    'CHA': 'ХАР',
    'strength': 'СИЛ',
    'dexterity': 'ЛОВ',
    'constitution': 'ВЫН',
    'intelligence': 'ИНТ',
    'wisdom': 'МДР',
    'charisma': 'ХАР'
  };
  
  return abilityMap[ability] || ability;
};

/**
 * Массив сокращенных названий характеристик
 */
export const abilityNames = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'];

/**
 * Полные названия характеристик
 */
export const abilityFullNames: Record<string, string> = {
  'STR': 'Сила',
  'DEX': 'Ловкость',
  'CON': 'Выносливость',
  'INT': 'Интеллект',
  'WIS': 'Мудрость',
  'CHA': 'Харизма',
  'strength': 'Сила',
  'dexterity': 'Ловкость',
  'constitution': 'Выносливость',
  'intelligence': 'Интеллект',
  'wisdom': 'Мудрость',
  'charisma': 'Харизма'
};
