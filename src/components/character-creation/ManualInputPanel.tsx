
// Update the getMaxAbilityScore function:

const getMaxAbilityScore = (): number => {
  if (maxAbilityScore) return maxAbilityScore;
  
  if (level >= 16) return ABILITY_SCORE_CAPS.ABSOLUTE_MAX;
  if (level >= 10) return 22; // Middle value between MAX and ABSOLUTE_MAX
  return ABILITY_SCORE_CAPS.MAX;
};
