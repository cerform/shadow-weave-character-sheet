
// Типы для характеристик персонажа
export type AbilityName = 'strength' | 'dexterity' | 'constitution' | 'intelligence' | 'wisdom' | 'charisma' | 
                         'STR' | 'DEX' | 'CON' | 'INT' | 'WIS' | 'CHA';

// Массив с названиями характеристик
export const abilityNames: AbilityName[] = [
  'strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'
];

// Краткие названия характеристик
export const abilityShortNames: Record<string, AbilityName> = {
  'strength': 'STR',
  'dexterity': 'DEX',
  'constitution': 'CON',
  'intelligence': 'INT',
  'wisdom': 'WIS',
  'charisma': 'CHA',
  'STR': 'STR',
  'DEX': 'DEX',
  'CON': 'CON',
  'INT': 'INT',
  'WIS': 'WIS',
  'CHA': 'CHA'
};

// Полные названия на русском языке
export const abilityFullNames: Record<AbilityName, string> = {
  'strength': 'Сила',
  'dexterity': 'Ловкость',
  'constitution': 'Телосложение',
  'intelligence': 'Интеллект',
  'wisdom': 'Мудрость',
  'charisма': 'Харизма',
  'STR': 'Сила',
  'DEX': 'Ловкость',
  'CON': 'Телосложение',
  'INT': 'Интеллект',
  'WIS': 'Мудрость',
  'CHA': 'Харизма'
};

// Конвертирует короткие имена в полные и наоборот
export function normalizeAbilityName(name: string): AbilityName | undefined {
  if (name in abilityFullNames) {
    return name as AbilityName;
  }
  
  // Конвертируем из русских названий в английские
  const reverseLookup = Object.entries(abilityFullNames).find(([_, value]) => value === name);
  if (reverseLookup) {
    return reverseLookup[0] as AbilityName;
  }
  
  return undefined;
}

// Получение модификатора характеристики
export function getAbilityModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

// Форматирование модификатора в строку (+2, -1 и т.д.)
export function formatModifier(modifier: number): string {
  return modifier >= 0 ? `+${modifier}` : `${modifier}`;
}

// Добавляем новую функцию для получения модификатора как строки
export function getAbilityModifierString(score: number): string {
  const modifier = getAbilityModifier(score);
  return formatModifier(modifier);
}
