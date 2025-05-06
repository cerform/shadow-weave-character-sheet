import { Character, Item } from '@/types/character';

/**
 * Вычисляет модификатор характеристики
 * @param abilityScore Значение характеристики
 * @returns Модификатор характеристики
 */
export const getAbilityModifier = (abilityScore: number): number => {
  return Math.floor((abilityScore - 10) / 2);
};

/**
 * Алиас для getAbilityModifier для обратной совместимости
 * @param abilityScore Значение характеристики
 * @returns Модификатор характеристики
 */
export const getModifierFromAbilityScore = getAbilityModifier;

/**
 * Вычисляет бонус мастерства по уровню персонажа
 * @param level Уровень персонажа
 * @returns Бонус мастерства
 */
export const calculateProficiencyBonus = (level: number): number => {
  return Math.floor((level - 1) / 4) + 2;
};

/**
 * Вычисляет общий модификатор способности из разных источников
 * @param character Персонаж
 * @param ability Характеристика
 * @returns Общий модификатор
 */
export const getAbilityTotalModifier = (character: Character, ability: string): number => {
  // Получаем базовый показатель способности
  let abilityScore = 10;
  const lowerAbility = ability.toLowerCase();
  
  if (character.abilities && character.abilities[ability as keyof typeof character.abilities]) {
    abilityScore = character.abilities[ability as keyof typeof character.abilities] as number;
  } else if (character.stats && character.stats[lowerAbility as keyof typeof character.stats]) {
    abilityScore = character.stats[lowerAbility as keyof typeof character.stats];
  } else if (character[lowerAbility as keyof Character]) {
    const value = character[lowerAbility as keyof Character];
    if (typeof value === 'number') {
      abilityScore = value;
    }
  }
  
  // Вычисляем и возвращаем модификатор
  return getAbilityModifier(abilityScore);
};

/**
 * Безопасно возвращает значение инициативы персонажа
 * @param character Персонаж
 * @returns Значение инициативы
 */
export const getInitiativeValue = (character: Character): number => {
  if (character.initiative !== undefined) {
    if (typeof character.initiative === 'number') {
      return character.initiative;
    } else if (typeof character.initiative === 'string') {
      const parsed = parseInt(character.initiative);
      if (!isNaN(parsed)) {
        return parsed;
      }
    }
  }
  
  // Если инициатива не задана, используем модификатор ловкости
  return getAbilityTotalModifier(character, 'dexterity');
};

/**
 * Форматирует бонус для отображения со знаком
 * @param bonus Числовое значение бонуса
 * @returns Строка с форматированным бонусом
 */
export const formatBonus = (bonus: number): string => {
  return bonus >= 0 ? `+${bonus}` : `${bonus}`;
};

/**
 * Преобразует название способности в удобочитаемый формат
 * @param ability Название способности
 * @returns Удобочитаемое название
 */
export const getAbilityName = (ability: string): string => {
  const nameMap: Record<string, string> = {
    strength: 'Сила',
    dexterity: 'Ловкость',
    constitution: 'Телосложение',
    intelligence: 'Интеллект',
    wisdom: 'Мудрость',
    charisma: 'Харизма',
    STR: 'Сила',
    DEX: 'Ловкость',
    CON: 'Телосложение',
    INT: 'Интеллект',
    WIS: 'Мудрость',
    CHA: 'Харизма'
  };
  
  return nameMap[ability] || ability;
};

// Добавляем вспомогательные функции для типов из battle.ts
/**
 * Создает дефолтного персонажа с базовыми свойствами
 * @returns Базовый шаблон персонажа
 */
export const createDefaultCharacter = (): Character => {
  return {
    id: "",
    name: "",
    level: 1,
    abilities: {
      STR: 10,
      DEX: 10,
      CON: 10,
      INT: 10,
      WIS: 10,
      CHA: 10,
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10
    },
    stats: {
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10
    }
  };
};

/**
 * Получает числовой модификатор без форматирования
 * @param abilityScore Значение характеристики
 * @returns Числовое значение модификатора
 */
export const getNumericModifier = (abilityScore: number): number => {
  return Math.floor((abilityScore - 10) / 2);
};

/**
 * Проверяет, является ли объект элементом инвентаря (Item), а не строкой
 * @param item Объект для проверки
 * @returns true, если объект является Item
 */
export const isItem = (item: string | Item): item is Item => {
  return typeof item === 'object' && item !== null;
};
