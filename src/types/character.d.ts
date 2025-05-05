
// Basic types
export interface CharacterSpell {
  id?: number | string;
  name: string;
  level: number;
  description?: string;
  school?: string;
  castingTime?: string;
  range?: string;
  components?: string;
  duration?: string;
  higherLevels?: string;
  verbal?: boolean;
  somatic?: boolean;
  material?: boolean;
  materialComponents?: string;
  ritual?: boolean;
  concentration?: boolean;
  classes?: string[] | string;
  prepared?: boolean;
}

export interface Character {
  id?: string | number;
  name: string;
  race: string;
  class: string;
  subclass?: string;
  level: number;
  background?: string;
  alignment?: string;
  experience?: number;
  abilities: AbilityScores;
  savingThrows?: Record<string, boolean>;
  skills?: Record<string, { proficient: boolean; expertise: boolean; bonus?: number }>;
  proficiencies?: string[];
  languages?: string[];
  hp?: {
    current: number;
    max: number;
    temporary: number;
  };
  ac?: number;
  speed?: number;
  initiative?: number;
  deathSaves?: {
    successes: number;
    failures: number;
  };
  spellcasting?: {
    ability: string;
    dc?: number;
    attackBonus?: number;
    preparedSpellsLimit?: number;
  };
  spells?: CharacterSpell[];
  proficiencyBonus?: number;
  
  // Additional properties required by tabs
  personalityTraits?: string;
  ideals?: string;
  bonds?: string;
  flaws?: string;
  appearance?: string;
  backstory?: string;
  features?: string[];
  traits?: string[];
  equipment?: string[] | {
    weapons?: string[];
    armor?: string;
    items?: string[];
  };
  money?: {
    cp?: number;
    sp?: number;
    ep?: number;
    gp?: number;
    pp?: number;
  };
  stats?: AbilityScores;
  userId?: string;
  abilityPointsUsed?: number;
  gender?: string;
  additionalClasses?: ClassLevel[];
  hitPoints?: {
    current: number;
    max: number;
    temporary: number;
  };
}

export interface ClassLevel {
  class: string;
  subclass?: string;
  level: number;
}

export interface AbilityScores {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
  
  // Short form aliases
  STR?: number;
  DEX?: number;
  CON?: number;
  INT?: number;
  WIS?: number;
  CHA?: number;
}

// Added to support CharacterSheet and for use across creation components
export interface CharacterSheet extends Character {
  // Character sheet specific properties can be added here
  // This is needed to maintain compatibility with existing components
}

// Added constants for ability score caps
export const ABILITY_SCORE_CAPS = {
  BASE_CAP: 20,
  EPIC_CAP: 22,
  LEGENDARY_CAP: 24
};

// HitPointEvent for DamageLog
export interface HitPointEvent {
  id: string;
  type: 'damage' | 'healing' | 'temp';
  amount: number;
  source?: string;
  timestamp: number;
  previousHP?: number;
  newHP?: number;
}
