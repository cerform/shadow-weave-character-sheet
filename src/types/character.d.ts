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
  temporaryHp?: number; // Добавляем для совместимости
  armorClass?: number;
  speed?: number;
  proficiencyBonus?: number;
  savingThrows?: Record<string, boolean>;
  proficiencies?: {
    languages?: string[];
    tools?: string[];
    weapons?: string[];
    armor?: string[];
    skills?: string[]; // Добавляем skills
  } | string[];
  // Добавляем поддержку обоих типов equipment
  equipment?: Item[] | {
    weapons?: string[];
    armor?: string;
    items?: string[];
  };
  features?: Feature[] | string[];
  spells?: CharacterSpell[] | string[];
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
  notes?: string; // Добавляем поле для заметок
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
  initiative?: string | number; // Добавляем поле initiative
  lastDiceRoll?: { // Добавляем поле для последнего броска костей
    diceType: string;
    count: number;
    modifier: number;
    rolls: number[];
    total: number;
    label: string;
    timestamp: string;
  };
  hitDice?: { // Добавляем поле для костей хитов
    total: number;
    used: number;
    dieType: string;
    value: string;
  };
  resources?: Record<string, { // Добавляем поле для ресурсов
    max: number;
    used: number;
    recoveryType?: 'short' | 'long' | 'short-rest' | 'long-rest';
  }>;
  sorceryPoints?: { // Добавляем поле для очков колдовства
    max: number;
    current: number;
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
  description?: string | string[];
  classes?: string[] | string;
  source?: string;
  verbal?: boolean;
  somatic?: boolean;
  material?: boolean;
  prepared?: boolean;
  ritual?: boolean;
  concentration?: boolean;
  materials?: string;
  higherLevels?: string;
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
