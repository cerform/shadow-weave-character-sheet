
/**
 * Получает модификатор характеристики персонажа
 * @param character Персонаж
 * @param ability Название характеристики (strength, dexterity, etc.)
 * @returns Модификатор характеристики
 */
import { Character } from '../types/character';

export function getAbilityModifier(character: Character, ability: string): number {
  if (!character) return 0;
  
  let abilityScore = 10; // По умолчанию 10 (модификатор 0)
  
  // Проверяем, есть ли характеристика напрямую в объекте персонажа
  const abilityMap: Record<string, keyof Character> = {
    'strength': 'strength',
    'dexterity': 'dexterity',
    'constitution': 'constitution',
    'intelligence': 'intelligence',
    'wisdom': 'wisdom',
    'charisma': 'charisma'
  };
  
  const characterKey = abilityMap[ability.toLowerCase()];
  if (characterKey && typeof character[characterKey] === 'number') {
    abilityScore = character[characterKey] as number;
  }
  
  // Если есть объект abilities, проверяем там
  else if (character.abilities) {
    const abilitiesKey = ability.toLowerCase() as keyof typeof character.abilities;
    if (character.abilities[abilitiesKey] && typeof character.abilities[abilitiesKey] === 'number') {
      abilityScore = character.abilities[abilitiesKey] as number;
    }
  }
  
  // Если есть объект stats, проверяем там
  else if (character.stats) {
    const statsKey = ability.toLowerCase() as keyof typeof character.stats;
    if (character.stats[statsKey] && typeof character.stats[statsKey] === 'number') {
      abilityScore = character.stats[statsKey] as number;
    }
  }
  
  // Вычисляем и возвращаем модификатор
  return Math.floor((abilityScore - 10) / 2);
}

/**
 * Вычисляет сложность спасброска для заклинаний персонажа
 * @param character Персонаж
 * @returns Сложность спасброска
 */
export function calculateSpellSaveDC(character: Character): number {
  if (!character) return 10;
  
  const proficiencyBonus = character.proficiencyBonus || Math.ceil(1 + (character.level || 1) / 4);
  const spellcastingAbility = character.spellcastingAbility || 'intelligence';
  const abilityModifier = getAbilityModifier(character, spellcastingAbility);
  
  // Стандартная формула сложности: 8 + бонус мастерства + модификатор характеристики
  return 8 + proficiencyBonus + abilityModifier;
}

/**
 * Вычисляет бонус к атаке заклинаниями персонажа
 * @param character Персонаж
 * @returns Бонус к атаке заклинаниями
 */
export function calculateSpellAttackBonus(character: Character): number {
  if (!character) return 0;
  
  const proficiencyBonus = character.proficiencyBonus || Math.ceil(1 + (character.level || 1) / 4);
  const spellcastingAbility = character.spellcastingAbility || 'intelligence';
  const abilityModifier = getAbilityModifier(character, spellcastingAbility);
  
  // Стандартная формула бонуса: бонус мастерства + модификатор характеристики
  return proficiencyBonus + abilityModifier;
}
