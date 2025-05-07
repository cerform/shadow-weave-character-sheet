
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
  initiative?: number | string;
  proficiencyBonus?: number;
  savingThrows?: Record<string, boolean>;
  savingThrowProficiencies?: string[];
  skillProficiencies?: string[];
  expertise?: string[];
  skillBonuses?: Record<string, number>;
  proficiencies?: {
    languages?: string[];
    tools?: string[];
    weapons?: string[];
    armor?: string[];
    skills?: string[];
  } | string[];
  equipment?: Item[] | string[] | {
    weapons?: string[];
    armor?: string;
    items?: string[];
  };
  features?: any[] | string[];
  spells?: any[] | string[];
  spellSlots?: Record<number, { max: number; used: number }>;
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
  gender?: string;
  userId?: string;
  abilityPointsUsed?: number;
  additionalClasses?: string[];
  spellcasting?: {
    ability?: string;
    class?: string;
    level?: number;
  };
  updatedAt?: string;
  createdAt?: string;
  image?: string;
  strength?: number;
  dexterity?: number;
  constitution?: number;
  intelligence?: number;
  wisdom?: number;
  charisma?: number;
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
  currency?: {
    cp?: number;
    sp?: number;
    ep?: number;
    gp?: number;
    pp?: number;
  };
}

export interface CharacterSpell {
  id?: string;
  name: string;
  level: number;
  school?: string;
  castingTime?: string;
  range?: string;
  components?: string;
  duration?: string;
  description?: string;
  prepared?: boolean;
}

export interface Item {
  id?: string;
  name: string;
  type?: string;
  quantity?: number;
  weight?: number;
  description?: string;
  value?: number;
  equipped?: boolean;
  cost?: number;
  costUnit?: string;
}

export interface Feature {
  id?: string;
  name: string;
  description: string;
  source?: string;
  level?: number;
}

export interface PlayerCharacter extends Character {
  player?: string;
  campaign?: string;
}

export const ABILITY_SCORE_CAPS = {
  min: 1,
  max: 30,
};

export interface HitPointEvent {
  type: 'damage' | 'healing' | 'temp' | 'max';
  value: number;
  source?: string;
  timestamp: string;
}

export interface LevelFeature {
  name: string;
  description: string;
  level: number;
  optional?: boolean;
  selected?: boolean;
}

export interface DiceResult {
  nickname: string;
  diceType: string;
  result: number;
  rolls?: number[];
  total?: number;
  label?: string;
}
