
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
    // Добавляем алиасы для удобства
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
  }>;
  hitPoints?: {
    current: number;
    maximum: number;
    temporary: number;
  };
  maxHp?: number;
  currentHp?: number;
  tempHp?: number;
  armorClass?: number;
  speed?: number;
  proficiencyBonus?: number;
  savingThrows?: Record<string, boolean>;
  proficiencies?: {
    languages?: string[];
    tools?: string[];
    weapons?: string[];
    armor?: string[];
  } | string[];
  equipment?: Item[];
  features?: Feature[];
  spells?: CharacterSpell[];
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
  updatedAt?: string;
  createdAt?: string;
  image?: string;
  strength?: number;
  dexterity?: number;
  constitution?: number;
  intelligence?: number;
  wisdom?: number;
  charisma?: number;
}

export interface CharacterSpell {
  name: string;
  level: number;
  school?: string;
  castingTime?: string;
  range?: string;
  components?: string;
  duration?: string;
  description?: string | string[]; // Поддерживает как строку, так и массив строк
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
