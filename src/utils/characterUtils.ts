
import { Character } from '@/types/character';

/**
 * Creates a default character object with basic properties
 */
export function createDefaultCharacter(): Character {
  return {
    id: crypto.randomUUID(),
    name: '',
    race: '',
    class: '',
    level: 1,
    experience: 0,
    alignment: 'Нейтральный',
    background: '',
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10,
    abilities: {
      STR: 10, DEX: 10, CON: 10, INT: 10, WIS: 10, CHA: 10,
      strength: 10, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10
    },
    hitDice: {
      total: 1,
      used: 0,
      dieType: 'd8',
      value: '1d8'
    },
    maxHp: 10,
    currentHp: 10,
    temporaryHp: 0,
    armorClass: 10,
    initiative: 0,
    speed: 30,
    spells: [],
    equipment: [],
    features: [],
    proficiencies: [],
    proficiencyBonus: 2,
    description: '',
    personality: '',
    ideals: '',
    bonds: '',
    flaws: ''
  };
}

/**
 * Calculate racial stat bonuses
 */
export function calculateStatBonuses(race: string): Record<string, number> {
  const bonuses: Record<string, number> = {
    STR: 0, DEX: 0, CON: 0, INT: 0, WIS: 0, CHA: 0
  };

  switch (race.toLowerCase()) {
    case 'дварф':
    case 'dwarf':
      bonuses.CON = 2;
      break;
    case 'эльф':
    case 'elf':
      bonuses.DEX = 2;
      break;
    case 'полурослик':
    case 'halfling':
      bonuses.DEX = 2;
      break;
    case 'человек':
    case 'human':
      bonuses.STR = 1;
      bonuses.DEX = 1;
      bonuses.CON = 1;
      bonuses.INT = 1;
      bonuses.WIS = 1;
      bonuses.CHA = 1;
      break;
    case 'драконорожденный':
    case 'dragonborn':
      bonuses.STR = 2;
      bonuses.CHA = 1;
      break;
    case 'гном':
    case 'gnome':
      bonuses.INT = 2;
      break;
    case 'полуэльф':
    case 'half-elf':
      bonuses.CHA = 2;
      // Полуэльфы получают +1 к двум другим характеристикам на выбор
      break;
    case 'полуорк':
    case 'half-orc':
      bonuses.STR = 2;
      bonuses.CON = 1;
      break;
    case 'тифлинг':
    case 'tiefling':
      bonuses.INT = 1;
      bonuses.CHA = 2;
      break;
    default:
      break;
  }

  return bonuses;
}

/**
 * Convert Partial<Character> to Character
 */
export function convertToCharacter(partialChar: Partial<Character>): Character {
  const defaultChar = createDefaultCharacter();
  return { ...defaultChar, ...partialChar };
}

/**
 * Calculate ability modifier from score
 */
export function getNumericModifier(abilityScore: number): number {
  return Math.floor((abilityScore - 10) / 2);
}

/**
 * Calculate ability modifier with sign
 */
export function calculateAbilityModifier(abilityScore: number): string {
  const modifier = getNumericModifier(abilityScore);
  return modifier >= 0 ? `+${modifier}` : `${modifier}`;
}

/**
 * Get modifier from ability score
 */
export function getModifierFromAbilityScore(abilityScore: number): number {
  return Math.floor((abilityScore - 10) / 2);
}

/**
 * Get ability modifier for a specific ability 
 */
export function getAbilityModifier(character: Character, ability: string): number {
  let score = 10;
  
  switch (ability.toLowerCase()) {
    case 'strength':
    case 'str':
      score = character.abilities?.strength || character.strength || 10;
      break;
    case 'dexterity':
    case 'dex':
      score = character.abilities?.dexterity || character.dexterity || 10;
      break;
    case 'constitution':
    case 'con':
      score = character.abilities?.constitution || character.constitution || 10;
      break;
    case 'intelligence':
    case 'int':
      score = character.abilities?.intelligence || character.intelligence || 10;
      break;
    case 'wisdom':
    case 'wis':
      score = character.abilities?.wisdom || character.wisdom || 10;
      break;
    case 'charisma':
    case 'cha':
      score = character.abilities?.charisma || character.charisma || 10;
      break;
  }
  
  return getNumericModifier(score);
}
