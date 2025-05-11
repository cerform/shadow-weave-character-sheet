
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
 * Calculate racial ability score bonuses based on race
 */
export function calculateStatBonuses(race: string): {
  STR?: number;
  DEX?: number;
  CON?: number;
  INT?: number;
  WIS?: number;
  CHA?: number;
} {
  switch (race.toLowerCase()) {
    case 'дварф':
    case 'dwarf':
      return { CON: 2 };
    case 'горный дварф':
    case 'mountain dwarf':
      return { STR: 2, CON: 2 };
    case 'холмовой дварф':
    case 'hill dwarf':
      return { CON: 2, WIS: 1 };
    case 'эльф':
    case 'elf':
      return { DEX: 2 };
    case 'высший эльф':
    case 'high elf':
      return { DEX: 2, INT: 1 };
    case 'лесной эльф':
    case 'wood elf':
      return { DEX: 2, WIS: 1 };
    case 'дроу':
    case 'тёмный эльф':
    case 'drow':
      return { DEX: 2, CHA: 1 };
    case 'полурослик':
    case 'halfling':
      return { DEX: 2 };
    case 'легконогий':
    case 'lightfoot':
      return { DEX: 2, CHA: 1 };
    case 'коренастый':
    case 'stout':
      return { DEX: 2, CON: 1 };
    case 'человек':
    case 'human':
      return { STR: 1, DEX: 1, CON: 1, INT: 1, WIS: 1, CHA: 1 };
    case 'драконорождённый':
    case 'dragonborn':
      return { STR: 2, CHA: 1 };
    case 'гном':
    case 'gnome':
      return { INT: 2 };
    case 'лесной гном':
    case 'forest gnome':
      return { INT: 2, DEX: 1 };
    case 'скальный гном':
    case 'rock gnome':
      return { INT: 2, CON: 1 };
    case 'полуэльф':
    case 'half-elf':
      return { CHA: 2 }; // +2 CHA and +1 to two others of player's choice
    case 'полуорк':
    case 'half-orc':
      return { STR: 2, CON: 1 };
    case 'тифлинг':
    case 'tiefling':
      return { CHA: 2, INT: 1 };
    default:
      return {};
  }
}

/**
 * Convert a partial character to a complete character object
 */
export function convertToCharacter(partialCharacter: Partial<any>): any {
  // Start with a default character
  const completeCharacter = createDefaultCharacter();
  
  // Merge the partial character with the default
  return {
    ...completeCharacter,
    ...partialCharacter,
    // Ensure nested objects are properly merged
    abilities: {
      ...completeCharacter.abilities,
      ...(partialCharacter.abilities || {}),
    },
    abilityScores: {
      ...completeCharacter.abilityScores,
      ...(partialCharacter.abilityScores || {}),
    },
    hitPoints: {
      ...completeCharacter.hitPoints,
      ...(partialCharacter.hitPoints || {}),
    },
    deathSaves: {
      ...completeCharacter.deathSaves,
      ...(partialCharacter.deathSaves || {}),
    },
    savingThrows: {
      ...completeCharacter.savingThrows,
      ...(partialCharacter.savingThrows || {}),
    },
    traits: {
      ...completeCharacter.traits,
      ...(partialCharacter.traits || {}),
    },
    appearance: {
      ...completeCharacter.appearance,
      ...(partialCharacter.appearance || {}),
    }
  };
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
    backstory: "",
    // For compatibility with older code
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
      charisma: 10
    },
    hp: 0,
    maxHp: 0,
    tempHp: 0,
    xp: 0,
    spellSlots: {},
  };
}
