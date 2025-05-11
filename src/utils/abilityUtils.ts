
export const getAbilityModifierValue = (abilityScore: number): number => {
  return Math.floor((abilityScore - 10) / 2);
};

export const formatModifier = (modifier: number): string => {
  if (modifier >= 0) {
    return `+${modifier}`;
  }
  return modifier.toString();
};

export const getAbilityModifier = (abilityScore: number): string => {
  const modifier = getAbilityModifierValue(abilityScore);
  return formatModifier(modifier);
};

export const getProficiencyBonus = (level: number): number => {
  return Math.floor((level - 1) / 4) + 2;
};
