
import { ABILITY_SCORE_CAPS } from "@/types/character";
import type Character from "@/types/character";

// Function to calculate the modifier from an ability score
export const getModifierFromAbilityScore = (abilityScore: number): number => {
  return Math.floor((abilityScore - 10) / 2);
};

// Function to get the modifier as a string (e.g., "+2" or "-1")
export const getModifierString = (abilityScore: number): string => {
  const modifier = Math.floor((abilityScore - 10) / 2);
  if (modifier >= 0) {
    return `+${modifier}`;
  }
  return `${modifier}`;
};

// Function to check if an ability score is within valid limits
export const isValidAbilityScore = (abilityScore: number): boolean => {
  return abilityScore >= ABILITY_SCORE_CAPS.MIN && abilityScore <= ABILITY_SCORE_CAPS.MAX;
};

// Function to calculate proficiency bonus based on character level
export const calculateProficiencyBonus = (level: number): number => {
  return Math.ceil((level + 1) / 4) + 1;
};

// Function to determine the saving throw bonus
export const getSavingThrowBonus = (abilityScore: number, proficiency: boolean, characterLevel: number): number => {
  let bonus = getModifierFromAbilityScore(abilityScore);
  if (proficiency) {
    bonus += calculateProficiencyBonus(characterLevel);
  }
  return bonus;
};

// Function to determine the skill check bonus
export const getSkillCheckBonus = (abilityScore: number, proficiency: boolean, expertise: boolean, characterLevel: number): number => {
  let bonus = getModifierFromAbilityScore(abilityScore);
  if (proficiency) {
    bonus += calculateProficiencyBonus(characterLevel);
  }
  if (expertise) {
    bonus += calculateProficiencyBonus(characterLevel);
  }
  return bonus;
};

// Added missing utility functions

// Calculate numeric modifier (alias for getModifierFromAbilityScore)
export const getNumericModifier = (abilityScore: number): number => {
  return Math.floor((abilityScore - 10) / 2);
};

// Calculate ability modifier
export const calculateAbilityModifier = (abilityScore: number): number => {
  return Math.floor((abilityScore - 10) / 2);
};

// Create a default character
export const createDefaultCharacter = (): Character => {
  return {
    id: crypto.randomUUID(),
    name: '',
    race: '',
    class: '',
    background: '',
    alignment: 'Нейтральный',
    level: 1,
    xp: 0,
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
      charisma: 10,
    },
    savingThrows: {
      STR: 0,
      DEX: 0,
      CON: 0,
      INT: 0,
      WIS: 0,
      CHA: 0,
      strength: 0,
      dexterity: 0,
      constitution: 0,
      intelligence: 0,
      wisdom: 0,
      charisma: 0,
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
    },
    resources: {},
    deathSaves: {
      successes: 0,
      failures: 0,
    },
    spellcasting: {
      ability: 'intelligence',
      dc: 10,
      attack: 0,
    },
    spellSlots: {},
    spells: [],
    equipment: {
      weapons: [],
      armor: '',
      items: [],
      gold: 0,
    },
    proficiencies: {
      languages: ['Common'],
      tools: [],
      weapons: [],
      armor: [],
    },
    features: [],
    notes: '',
    savingThrowProficiencies: [],
    skillProficiencies: [],
    expertise: [],
    skillBonuses: {},
  };
};
