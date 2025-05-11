
import { Character, AbilityScores } from '@/types/character';
import { v4 as uuidv4 } from 'uuid';

/**
 * Get numeric modifier from an ability score
 */
export function getNumericModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

/**
 * Get modifier string (e.g., "+2", "-1") from an ability score
 */
export function getModifierFromAbilityScore(score: number): string {
  const mod = getNumericModifier(score);
  return mod >= 0 ? `+${mod}` : `${mod}`;
}

/**
 * Alias for getNumericModifier for backward compatibility
 */
export function getAbilityModifier(score: number): number {
  return getNumericModifier(score);
}

/**
 * Create a default character with minimal required properties
 */
export function createDefaultCharacter(): Character {
  const now = new Date().toISOString();
  return {
    id: uuidv4(),
    name: 'Новый персонаж',
    race: '',
    class: '',
    background: '',
    alignment: 'Нейтральный',
    level: 1,
    xp: 0,
    abilities: {
      STR: 10, DEX: 10, CON: 10, INT: 10, WIS: 10, CHA: 10,
      strength: 10, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10
    },
    savingThrows: {
      STR: 0, DEX: 0, CON: 0, INT: 0, WIS: 0, CHA: 0,
      strength: 0, dexterity: 0, constitution: 0, intelligence: 0, wisdom: 0, charisma: 0
    },
    skills: {},
    hp: 0,
    maxHp: 0,
    temporaryHp: 0,
    ac: 10,
    proficiencyBonus: 2,
    speed: 30,
    initiative: 0,
    inspiration: false,
    hitDice: {
      total: 1,
      used: 0,
      dieType: 'd8',
      value: 'd8',
      remaining: 1
    },
    resources: {},
    deathSaves: {
      successes: 0,
      failures: 0
    },
    spellcasting: {
      ability: '',
      dc: 0,
      attack: 0
    },
    spellSlots: {},
    spells: [],
    equipment: {
      weapons: [],
      armor: '',
      items: [],
      gold: 0
    },
    proficiencies: {
      languages: [],
      tools: [],
      weapons: [],
      armor: [],
      skills: []
    },
    features: [],
    notes: '',
    createdAt: now,
    updatedAt: now,
    lastUsed: now
  };
}

/**
 * Calculate racial stat bonuses based on race
 */
export function calculateStatBonuses(race: string): Partial<AbilityScores> {
  const raceBonuses: Record<string, Partial<AbilityScores>> = {
    'Человек': { STR: 1, DEX: 1, CON: 1, INT: 1, WIS: 1, CHA: 1 },
    'Эльф': { DEX: 2 },
    'Дроу': { DEX: 2, CHA: 1 },
    'Высший эльф': { DEX: 2, INT: 1 },
    'Лесной эльф': { DEX: 2, WIS: 1 },
    'Полуэльф': { CHA: 2 }, // +1 to two other ability scores of your choice
    'Дварф': { CON: 2 },
    'Горный дварф': { CON: 2, STR: 2 },
    'Холмовой дварф': { CON: 2, WIS: 1 },
    'Полуорк': { STR: 2, CON: 1 },
    'Гном': { INT: 2 },
    'Лесной гном': { INT: 2, DEX: 1 },
    'Скальный гном': { INT: 2, CON: 1 },
    'Полурослик': { DEX: 2 },
    'Коренастый': { DEX: 2, CON: 1 },
    'Легконогий': { DEX: 2, CHA: 1 },
    'Тифлинг': { CHA: 2, INT: 1 },
    'Драконорожденный': { STR: 2, CHA: 1 }
  };
  
  return raceBonuses[race] || {};
}

/**
 * Convert a partial character to a full character with defaults
 */
export function convertToCharacter(partial: Partial<Character>): Character {
  const defaultChar = createDefaultCharacter();
  
  // Merge the partial character with the default character
  return {
    ...defaultChar,
    ...partial,
    // Ensure abilities and other nested objects are merged correctly
    abilities: {
      ...defaultChar.abilities,
      ...(partial.abilities || {})
    },
    hitDice: {
      ...defaultChar.hitDice,
      ...(partial.hitDice || {})
    },
    proficiencies: {
      ...defaultChar.proficiencies,
      ...(partial.proficiencies || {})
    },
    spellcasting: {
      ...defaultChar.spellcasting,
      ...(partial.spellcasting || {})
    }
  };
}

export function isMagicClass(className: string): boolean {
  const magicClasses = [
    'Бард', 'Жрец', 'Друид', 'Волшебник', 'Колдун', 
    'Чародей', 'Паладин', 'Следопыт'
  ];
  
  return magicClasses.includes(className);
}

