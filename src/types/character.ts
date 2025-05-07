
export interface Character {
  id?: string;
  name: string;
  race?: string;
  subrace?: string;
  class?: string;
  className?: string;
  subclass?: string;
  background?: string;
  level: number;
  experience?: number;
  alignment?: string;
  abilities?: {
    STR: number;
    DEX: number;
    CON: number;
    INT: number;
    WIS: number;
    CHA: number;
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
  };
  stats?: {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
  };
  skills?: Record<string, {
    proficient: boolean;
    expertise?: boolean;
    value?: number;
    bonus?: number;
  }>;
  hitPoints?: {
    current: number;
    maximum: number;
    temporary: number;
  };
  maxHp?: number;
  currentHp?: number;
  tempHp?: number;
  temporaryHp?: number;
  armorClass?: number;
  speed?: number;
  proficiencyBonus?: number;
  savingThrows?: Record<string, boolean>;
  savingThrowProficiencies?: Record<string, boolean>; // Добавлено для AbilitiesTab
  skillProficiencies?: string[]; // Добавлено для AbilitiesTab
  expertise?: string[]; // Добавлено для AbilitiesTab 
  skillBonuses?: Record<string, number>; // Добавлено для AbilitiesTab
  proficiencies?: {
    languages?: string[];
    tools?: string[];
    weapons?: string[];
    armor?: string[];
    skills?: string[];
  } | string[];
  equipment?: Item[] | {
    weapons?: string[];
    armor?: string;
    items?: string[];
  };
  features?: Feature[] | string[];
  spells?: CharacterSpell[] | string[];
  spellSlots?: Record<number, { max: number; used: number }>;
  spellcasting?: { // Добавлено для SpellsTab
    ability: string;
    saveDC: number;
    attackBonus: number;
    level?: number;
  };
  money?: {
    cp?: number;
    sp?: number;
    ep?: number;
    gp?: number;
    pp?: number;
  };
  gold?: number;
  deathSaves?: {
    successes: number;
    failures: number;
  };
  inspiration?: boolean;
  bonds?: string;
  flaws?: string;
  ideals?: string;
  personalityTraits?: string;
  appearance?: string;
  backstory?: string;
  notes?: string;
  raceFeatures?: {
    name: string;
    description: string;
    level?: number;
  }[];
  classFeatures?: {
    name: string;
    description: string;
    level?: number;
  }[];
  backgroundFeatures?: {
    name: string;
    description: string;
    level?: number;
  }[];
  feats?: {
    name: string;
    description: string;
    level?: number;
  }[];
  additionalClasses?: Array<{  // Добавлено для useCharacterCreation
    name: string;
    level: number;
    subclass?: string;
  }>;
  currency?: {
    cp?: number;
    sp?: number;
    ep?: number;
    gp?: number;
    pp?: number;
  };
  updatedAt?: string;
  createdAt?: string;
  image?: string;
  gender?: string;
  userId?: string;
  abilityPointsUsed?: number;
  strength?: number;
  dexterity?: number;
  constitution?: number;
  intelligence?: number;
  wisdom?: number;
  charisma?: number;
  initiative?: string | number;
  lastDiceRoll?: {
    diceType: string;
    count: number;
    modifier: number;
    rolls: number[];
    total: number;
    label: string;
    timestamp: string;
  };
  hitDice?: {
    total: number;
    used: number;
    dieType: string;
    value: string;
  };
  resources?: Record<string, {
    max: number;
    used: number;
    recoveryType?: 'short' | 'long' | 'short-rest' | 'long-rest';
  }>;
  sorceryPoints?: {
    max: number;
    current: number;
  };
}

export interface CharacterSpell {
  name: string;
  level: number;
  school?: string;
  castingTime?: string;
  range?: string;
  components?: string;
  duration?: string;
  description?: string | string[];
  classes?: string[] | string;
  source?: string;
  ritual?: boolean;
  concentration?: boolean;
  verbal?: boolean;
  somatic?: boolean;
  material?: boolean;
  prepared?: boolean;
  higherLevel?: string;
  higherLevels?: string;
  id?: string | number;
  materials?: string;
}

export interface Item {
  name: string;
  quantity: number;
  weight?: number;
  description?: string;
  type?: string;
  equipped?: boolean;
  cost?: number;
  costUnit?: string;
}

export interface Feature {
  name: string;
  source: string;
  description: string;
  level?: number;
}

export interface PlayerCharacter extends Character {
  userId: string;
}

// Export ability score caps
export const ABILITY_SCORE_CAPS = {
  BASE_CAP: 20,
  EPIC_CAP: 22,
  LEGENDARY_CAP: 24
};

// Add HitPointEvent for DamageLog
export interface HitPointEvent {
  id: string;
  type: 'damage' | 'healing' | 'temp' | 'heal' | 'tempHP' | 'death-save';
  amount: number;
  source?: string;
  timestamp: number | Date;
  previousHP?: number;
  newHP?: number;
}

// Add LevelFeature interface for useLevelFeatures hook
export interface LevelFeature {
  id: string;
  level: number;
  name: string;
  description: string;
  type: string;
  class?: string;
  required?: boolean;
}
