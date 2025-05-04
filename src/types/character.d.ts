
export interface AbilityScores {
  STR: number;
  DEX: number;
  CON: number;
  INT: number;
  WIS: number;
  CHA: number;
  // Добавляем полные имена для совместимости
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
}

export interface Proficiencies {
  armor?: string[];
  weapons?: string[];
  tools?: string[];
  languages?: string[];
}

export interface SorceryPoints {
  max: number;
  used: number;
}

export interface CharacterSpell {
  id?: string | number;
  name: string;
  level: number;
  school: string;
  description: string;
  castingTime?: string;
  range?: string;
  components?: string;
  duration?: string;
  verbal: boolean;
  somatic: boolean;
  material: boolean;
  materialComponents?: string;
  prepared: boolean;
  ritual?: boolean;
  concentration?: boolean;
}

export interface CharacterSheet {
  id?: string;
  userId?: string;
  name: string;
  race: string;
  subrace?: string;
  class: string;
  className?: string; // для совместимости
  subclass?: string;
  level: number;
  abilities: AbilityScores;
  skills?: { [key: string]: { proficient: boolean; expertise: boolean; bonus?: number } };
  savingThrows?: { [key: string]: boolean };
  proficiencies: string[] | Proficiencies;  // Allow both formats for backward compatibility
  proficiencyBonus?: number;
  equipment: string[];
  spells: string[] | CharacterSpell[];  // Allow both formats for backward compatibility
  languages: string[];
  gender: string;
  alignment: string;
  background: string;
  backstory: string;
  maxHp?: number;
  currentHp?: number;
  temporaryHp?: number;
  hitDice?: {
    total: number;
    used: number;
    value: string;
  };
  deathSaves?: {
    successes: number;
    failures: number;
  };
  spellSlots?: {
    [level: string]: {
      max: number;
      used: number;
    };
  };
  sorceryPoints?: SorceryPoints;
  createdAt?: string;
  updatedAt?: string;
  image?: string;
  skillProficiencies?: { [skillName: string]: boolean };
  savingThrowProficiencies?: { [ability: string]: boolean };
}

export interface ClassRequirement {
  abilities: { 
    strength?: number;
    dexterity?: number;
    constitution?: number;
    intelligence?: number;
    wisdom?: number;
    charisma?: number;
  };
  description: string;
}

// Types for racial traits and features
export interface RacialTraits {
  race: string;
  abilityScoreIncrease: string;
  age: string;
  alignment: string;
  size: string;
  speed: string;
  languages: string[];
  features: { name: string; description: string }[];
}

// Types for class features
export interface ClassFeatures {
  name: string;
  hitDice: string;
  primaryAbility: string[];
  savingThrowProficiencies: string[];
  armorProficiencies: string[];
  weaponProficiencies: string[];
  toolProficiencies: string[];
  skillChoices: string[];
  numberOfSkillChoices: number;
  features: { name: string; level: number; description: string }[];
  spellcasting?: {
    ability: string;
    cantripsKnown?: number[];
    spellsKnown?: number[];
    spellSlots?: { [level: string]: number[] };
  };
}

// Types for backgrounds
export interface Background {
  name: string;
  skillProficiencies: string[];
  toolProficiencies?: string[];
  languages?: string[];
  equipment: string[];
  feature: {
    name: string;
    description: string;
  };
  suggestedCharacteristics?: {
    personalityTraits: string[];
    ideals: string[];
    bonds: string[];
    flaws: string[];
  };
}

// Ability score caps
export const ABILITY_SCORE_CAPS = {
  MIN: 1,
  DEFAULT: 10, 
  MAX: 20,
  ABSOLUTE_MAX: 30
};
