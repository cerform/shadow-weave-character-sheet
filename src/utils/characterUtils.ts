
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

/**
 * Создает персонажа с базовыми значениями
 */
export const createDefaultCharacter = (): Character => {
  const id = Date.now().toString();
  return {
    id,
    name: 'Новый персонаж',
    level: 1,
    abilities: {
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10,
      // Добавляем сокращения для обратной совместимости
      STR: 10,
      DEX: 10,
      CON: 10,
      INT: 10,
      WIS: 10,
      CHA: 10
    },
    race: 'Человек',
    class: 'Воин',
    background: '',
    alignment: 'Нейтральный',
    maxHp: 10,
    currentHp: 10,
    armorClass: 10,
    proficiencyBonus: 2,
    initiative: 0,
    deathSaves: {
      successes: 0,
      failures: 0
    },
    hitDice: {
      total: 1,
      used: 0,
      type: 'd10'
    },
    spells: [],
    equipment: [],
    proficiencies: [],
    features: [],
    notes: '',
    skillProficiencies: [],
    expertise: [],
    savingThrowProficiencies: ['strength', 'constitution'],
    spellSlots: {}
  };
};

import { Character } from '@/types/character';

// Make sure this function is properly exported
export { createDefaultCharacter };
