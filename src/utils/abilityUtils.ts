
/**
 * Calculate ability score modifier from score
 */
export function calculateModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

/**
 * Get the full name of an ability from its key
 */
export function getAbilityNameFull(ability: string): string {
  const abilityNames: Record<string, string> = {
    strength: 'Сила',
    dexterity: 'Ловкость',
    constitution: 'Телосложение',
    intelligence: 'Интеллект',
    wisdom: 'Мудрость',
    charisma: 'Харизма',
    STR: 'Сила',
    DEX: 'Ловкость',
    CON: 'Телосложение',
    INT: 'Интеллект',
    WIS: 'Мудрость',
    CHA: 'Харизма'
  };

  return abilityNames[ability] || ability;
}

/**
 * Get ability score modifier with plus or minus sign
 */
export function getModifierFromAbilityScore(score: number): string {
  const modifier = calculateModifier(score);
  return modifier >= 0 ? `+${modifier}` : `${modifier}`;
}
