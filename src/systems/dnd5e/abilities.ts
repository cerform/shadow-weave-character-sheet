// src/systems/dnd5e/abilities.ts
import type { AbilityScore, Abilities } from '@/types/dnd5e';

/**
 * Вычисляет модификатор характеристики по правилам D&D 5e
 */
export function getAbilityModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

/**
 * Получает модификатор для конкретной характеристики
 */
export function getModifier(abilities: Abilities, ability: AbilityScore): number {
  return getAbilityModifier(abilities[ability]);
}

/**
 * Вычисляет бонус мастерства по уровню персонажа
 */
export function getProficiencyBonus(level: number): number {
  return Math.ceil(level / 4) + 1;
}

/**
 * Вычисляет инициативу (d20 + модификатор ловкости)
 */
export function rollInitiative(abilities: Abilities): number {
  const roll = Math.floor(Math.random() * 20) + 1;
  const dexModifier = getModifier(abilities, 'dexterity');
  return roll + dexModifier;
}

/**
 * Вычисляет бонус атаки
 */
export function getAttackBonus(
  abilities: Abilities, 
  proficiencyBonus: number, 
  ability: AbilityScore,
  isProficient: boolean = true
): number {
  const abilityModifier = getModifier(abilities, ability);
  const proficiency = isProficient ? proficiencyBonus : 0;
  return abilityModifier + proficiency;
}

/**
 * Вычисляет спасбросок
 */
export function getSavingThrow(
  abilities: Abilities,
  proficiencyBonus: number,
  ability: AbilityScore,
  isProficient: boolean = false
): number {
  const abilityModifier = getModifier(abilities, ability);
  const proficiency = isProficient ? proficiencyBonus : 0;
  return abilityModifier + proficiency;
}

/**
 * Проверяет успешность спасброска
 */
export function rollSavingThrow(
  abilities: Abilities,
  proficiencyBonus: number,
  ability: AbilityScore,
  dc: number,
  isProficient: boolean = false
): { success: boolean; roll: number; total: number } {
  const roll = Math.floor(Math.random() * 20) + 1;
  const bonus = getSavingThrow(abilities, proficiencyBonus, ability, isProficient);
  const total = roll + bonus;
  
  return {
    success: total >= dc,
    roll,
    total
  };
}