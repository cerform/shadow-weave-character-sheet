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
  // Добавляем недостающие свойства
  skillProficiencies?: string[];
  skillBonuses?: Record<string, number>;
  savingThrowProficiencies?: string[];
  expertise?: string[];
  
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
  initiative?: number;
  savingThrows?: Record<string, boolean>;
  
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
    gold?: number;
  };
  
  features?: string[] | Feature[];
  spells?: CharacterSpell[] | string[];
  spellSlots?: Record<string | number, { max: number; used: number }>;
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
  
  notes?: string;
  hitDice?: {
    total: number;
    used: number;
    dieType: string;
  };
  resources?: Record<string, {
    max: number;
    used: number;
    name: string;
    recoveryType?: 'short-rest' | 'long-rest' | 'short' | 'long';
  }>;
  sorceryPoints?: {
    max: number;
    current?: number;
    used?: number;
  };
  
  // Исправляем тип lastDiceRoll для соответствия коду в DicePanel.tsx
  lastDiceRoll?: {
    type: string;
    result: number | number[];
    modifier: number;
    total: number;
    advantage?: boolean;
    disadvantage?: boolean;
    timestamp: number;
    // Добавляем дополнительные свойства, используемые в компонентах
    diceType?: string;
    count?: number;
    rolls?: number[];
    label?: string;
  };

  // Adding missing properties from errors
  additionalClasses?: string[];
  spellcasting?: {
    ability?: string;
    dc?: number;
    attack?: number;
    preparedSpellsLimit?: number;
  };
  
  // Make sure these properties exist as mentioned in errors
  notes?: string;
  savingThrowProficiencies?: string[];
  skillProficiencies?: string[];
  expertise?: string[];
  skillBonuses?: Record<string, number>;
  
  // Ensure spell property is flexible enough
  spells?: (CharacterSpell | string)[] | CharacterSpell[] | string[];
  
  // Ensure equipment property is flexible enough
  equipment?: Item[] | string[] | {
    weapons?: string[];
    armor?: string;
    items?: string[];
    gold?: number;
  };
  
  // Ensure features property is flexible enough
  features?: string[] | Feature[] | (string | Feature)[];
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

export const ABILITY_SCORE_CAPS = {
  BASE_CAP: 20,
  EPIC_CAP: 22,
  LEGENDARY_CAP: 24
};

export interface HitPointEvent {
  id: string;
  type: 'damage' | 'healing' | 'temp' | 'heal' | 'tempHP' | 'death-save';
  amount: number;
  source?: string;
  timestamp: number | Date;
  previousHP?: number;
  newHP?: number;
}

export interface LevelFeature {
  id: string;
  level: number;
  name: string;
  description: string;
  type: string;
  class?: string;
  required?: boolean;
}
