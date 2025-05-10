import { ABILITY_SCORE_CAPS } from "@/types/character";

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
