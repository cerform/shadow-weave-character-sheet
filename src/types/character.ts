
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
  // Добавляем поле stats для обратной совместимости
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
  // Добавляем алиасы для hitPoints
  maxHp?: number;
  currentHp?: number;
  tempHp?: number;
  temporaryHp?: number; 
  armorClass?: number;
  speed?: number;
  proficiencyBonus?: number;
  savingThrows?: Record<string, boolean>;
  proficiencies?: {
    languages?: string[];
    tools?: string[];
    weapons?: string[];
    armor?: string[];
    skills?: string[];
  } | string[];
  // Добавляем поддержку обоих типов equipment
  equipment?: Item[] | {
    weapons?: string[];
    armor?: string;
    items?: string[];
  };
  features?: Feature[] | string[];
  spells?: CharacterSpell[];
  spellSlots?: Record<number, { max: number; used: number }>;
  money?: {
    cp?: number;
    sp?: number;
    ep?: number;
    gp?: number;
    pp?: number;
  };
  // Добавляем поля для gold
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
  // Изменяем названия свойств для особенностей (расовых, классовых, черт и т.д.)
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
  // Added properties for timestamps
  updatedAt?: string;
  createdAt?: string;
  // Added property for character image
  image?: string;
  // Пользовательские поля
  gender?: string;
  userId?: string;
  abilityPointsUsed?: number;
  // Добавляем поля для обратной совместимости
  strength?: number;
  dexterity?: number;
  constitution?: number;
  intelligence?: number;
  wisdom?: number;
  charisma?: number;
  
  // Добавляем новые поля, которые используются в компонентах
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
  
  // Добавляем поля для AbilitiesTab
  savingThrowProficiencies?: string[];
  skillProficiencies?: string[];
  expertise?: string[];
  skillBonuses?: Record<string, number>;
  
  // Поле для настройки заклинаний
  spellcasting?: {
    ability?: string;
    saveDC?: number;
    attackBonus?: number;
    prepared?: boolean;
    preparedSpellsLimit?: number;
  };
  
  // Дополнительные поля для хука useCharacterCreation
  additionalClasses?: string[];
  languages?: string[];
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
  higherLevels?: string; // используем только higherLevels
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
