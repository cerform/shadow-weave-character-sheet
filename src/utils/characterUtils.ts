
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

/**
 * Get modifier from ability score (alias for getAbilityModifier for backward compatibility)
 */
export function getModifierFromAbilityScore(score: number): number {
  return getAbilityModifier(score);
}

/**
 * Create a default character template
 */
export function createDefaultCharacter() {
  return {
    id: "",
    name: "",
    race: "",
    class: "",
    level: 1,
    background: "",
    alignment: "",
    experiencePoints: 0,
    abilityScores: {
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10
    },
    hitPoints: {
      maximum: 0,
      current: 0,
      temporary: 0
    },
    deathSaves: {
      successes: 0,
      failures: 0
    },
    armorClass: 10,
    initiative: 0,
    speed: 30,
    inspiration: false,
    proficiencyBonus: 2,
    savingThrows: {
      strength: false,
      dexterity: false,
      constitution: false,
      intelligence: false,
      wisdom: false,
      charisma: false
    },
    skills: {},
    equipment: [],
    spells: [],
    features: [],
    traits: {
      personalityTraits: "",
      ideals: "",
      bonds: "",
      flaws: ""
    },
    appearance: {
      age: 0,
      height: "",
      weight: 0,
      eyes: "",
      skin: "",
      hair: ""
    },
    backstory: ""
  };
}
