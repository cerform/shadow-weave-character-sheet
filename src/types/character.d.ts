
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
  current?: number; // Added for backward compatibility
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
  classes?: string | string[]; // Added to match usage in components
  higherLevels?: string; // Added to match usage in components
}

export interface HitPointEvent {
  type: 'damage' | 'heal' | 'temp';
  value: number;
  timestamp: number;
  source?: string;
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
  stats?: {  // Added to match usage in components
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
  };
  features?: string[]; // Added to match usage in LevelBasedFeatures.tsx
  personalityTraits?: string; // Added for background info
  ideals?: string; // Added for background info
  bonds?: string; // Added for background info
  flaws?: string; // Added for background info
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
  abilityScoreIncrease: string | number; // Updated to accept both string and number
  age: string;
  alignment: string;
  size: string;
  speed: string | number; // Updated to accept both string and number
  languages: string[];
  features: { name: string; description: string }[];
}

// Types for class features
export interface ClassFeatures {
  name: string;
  hitDice: string;
  primaryAbility: string[] | string; // Updated to accept both string and string[]
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
    personalityTraits?: string[]; // Updated to match usage
    ideals?: string[];
    bonds?: string[];
    flaws?: string[];
  };
  personalityTraits?: string[]; // Added to match usage in data files
  ideals?: string[]; // Added to match usage in data files
  bonds?: string[]; // Added to match usage in data files
  flaws?: string[]; // Added to match usage in data files
}

// Ability score caps
export const ABILITY_SCORE_CAPS = {
  MIN: 1,
  DEFAULT: 10, 
  MAX: 20,
  ABSOLUTE_MAX: 30,
  BASE_CAP: 20,          // Added to match usage in components
  EPIC_CAP: 22,          // Added to match usage in components
  LEGENDARY_CAP: 24      // Added to match usage in components
};
