
/**
 * Get ability modifier from ability score
 */
export function getAbilityModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

/**
 * Calculate ability modifier and format it as a string with + or - sign
 */
export function calculateAbilityModifier(score: number): string {
  const modifier = Math.floor((score - 10) / 2);
  return modifier >= 0 ? `+${modifier}` : `${modifier}`;
}

/**
 * Get numeric modifier from ability score
 */
export function getNumericModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

/**
 * Calculate proficiency bonus based on character level
 */
export function calculateProficiencyBonus(level: number): number {
  return Math.ceil(1 + level / 4);
}
