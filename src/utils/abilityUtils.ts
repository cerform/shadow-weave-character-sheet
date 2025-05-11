
/**
 * Calculates ability modifier based on ability score
 * @param abilityScore The ability score value
 * @returns The modifier as a number
 */
export function getModifier(abilityScore: number): number {
  return Math.floor((abilityScore - 10) / 2);
}

/**
 * Formats ability modifier as a string with + or - prefix
 * @param abilityScore The ability score value
 * @returns Formatted modifier string like "+3" or "-1"
 */
export function getModifierText(abilityScore: number): string {
  const mod = getModifier(abilityScore);
  return mod >= 0 ? `+${mod}` : `${mod}`;
}

/**
 * Returns ability score based on specified method
 * @param method The method for generating ability scores
 * @returns Default ability score based on method
 */
export function getDefaultAbilityScore(method: "standard" | "pointbuy" | "roll" | "manual"): number {
  switch (method) {
    case "standard":
      return 10;
    case "pointbuy":
      return 8;
    default:
      return 10;
  }
}

/**
 * Formats ability modifier as a string with proper sign
 * @param modifier The ability modifier value
 * @returns Formatted string like "+3" or "-1"
 */
export function getAbilityModifierString(modifier: number): string {
  return modifier >= 0 ? `+${modifier}` : `${modifier}`;
}
