
// Define essential types
export interface AbilityScores {
  STR: number;
  DEX: number;
  CON: number;
  INT: number;
  WIS: number;
  CHA: number;
  strength?: number;
  dexterity?: number;
  constitution?: number;
  intelligence?: number;
  wisdom?: number;
  charisma?: number;
}

export interface Feature {
  name: string;
  source: string;
  description: string;
  level?: number;
  id?: string; // Added ID property for LevelFeature compatibility
}

export interface Item {
  name: string;
  quantity?: number;
  type?: 'weapon' | 'armor' | 'item';
  description?: string;
  properties?: string[];
  cost?: number;
  weight?: number;
}

export interface CharacterSpell {
  id: string; // Обязательное поле
  name: string;
  level: number;
  school: string; // Обязательное поле
  castingTime?: string;
  range?: string;
  components?: string;
  duration?: string;
  description?: string | string[];
  prepared?: boolean;
  ritual?: boolean;
  concentration?: boolean;
  verbal?: boolean;
  somatic?: boolean;
  material?: boolean;
  materials?: string;
  higherLevels?: string;
  higherLevel?: string;
  classes?: string[] | string;
  source?: string;
}

export interface HitPointEvent {
  id: string;
  type: 'damage' | 'healing' | 'temp' | 'tempHP' | 'heal' | 'death-save';
  amount: number;
  source: string;
  timestamp: string | number | Date;
  description?: string;
}

export interface LevelFeature {
  level: number;
  title: string;
  description: string;
  options?: string[];
  id: string; // Made ID property required for compatibility
  name?: string; // Added for backward compatibility
  type?: string; // Added for backward compatibility
  required?: boolean; // Added for backward compatibility
}

// Добавляем интерфейс для personality
export interface CharacterPersonality {
  traits: string;
  ideals: string;
  bonds: string;
  flaws: string;
}

export interface Character {
  id: string;
  name: string;
  race: string;
  subrace?: string;
  class: string;
  className?: string;
  subclass?: string;
  background: string;
  alignment: string;
  level: number;
  xp: number;
  abilities: AbilityScores;
  savingThrows: AbilityScores;
  skills: Record<string, { proficient: boolean; expertise: boolean; value: number }>;
  hp: number;
  maxHp: number;
  temporaryHp: number; 
  tempHp?: number; // alias for temporaryHp
  ac: number;
  armorClass?: number; // alias for ac
  proficiencyBonus: number;
  speed: number;
  initiative: number; 
  inspiration: boolean;
  hitDice: {
    total: number;
    used: number;
    dieType: string;
    current?: number; // Added for backward compatibility
    value?: string; // Added for backward compatibility
  };
  resources: Record<string, {
    max: number;
    used: number;
    name: string;
    recoveryType?: 'short-rest' | 'long-rest' | 'short' | 'long';
  }>;
  deathSaves: {
    successes: number;
    failures: number;
  };
  spellcasting: {
    ability: string;
    dc: number;
    attack: number;
    preparedSpellsLimit?: number;
  };
  spellSlots: Record<string, { max: number; used: number }>;
  sorceryPoints?: {
    max: number;
    current?: number;
    used?: number;
  }; 
  spells: CharacterSpell[];
  equipment: {
    weapons: string[];
    armor: string;
    items: string[];
    gold: number;
  } | Item[];
  proficiencies: {
    languages: string[];
    tools: string[];
    weapons?: string[];
    armor?: string[];
    skills?: string[];
  };
  features: Feature[];
  notes: string;
  lastDiceRoll?: {
    type: string;
    result: number | number[];
    modifier: number;
    total: number;
    advantage?: boolean;
    disadvantage?: boolean;
    timestamp: number;
    diceType?: string;
    count?: number;
    rolls?: number[];
    label?: string;
  };
  
  // Добавляем personality
  personality?: CharacterPersonality;
  
  // Additional properties needed
  currentHp?: number;
  gender?: string;
  avatar?: string;
  portrait?: string; // Added for backward compatibility
  image?: string; // Добавляем поле image для совместимости с characterPdfGenerator.ts
  currency?: {
    cp: number;
    sp: number;
    ep: number;
    gp: number;
    pp: number;
  };
  personalityTraits?: string;
  ideals?: string;
  bonds?: string;
  flaws?: string;
  appearance?: string;
  backstory?: string;
  createdAt?: string;
  updatedAt?: string;
  stats?: {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
  };
  // Explicit properties for direct access
  strength?: number;
  dexterity?: number;
  constitution?: number;
  intelligence?: number;
  wisdom?: number;
  charisma?: number;
  experience?: number; // Alias for xp
  raceFeatures?: Feature[];
  classFeatures?: Feature[];
  backgroundFeatures?: Feature[];
  feats?: Feature[];
  hitPoints?: {
    current: number;
    max: number;
    temporary: number;
    maximum?: number;
  };
  userId?: string; // For database reference
  additionalClasses?: Array<{class: string, level: number, subclass?: string}>;
  abilityPointsUsed?: number;
  savingThrowProficiencies?: string[];
  skillProficiencies?: string[];
  skillBonuses?: Record<string, number>;
  expertise?: string[];
}

// Export ABILITY_SCORE_CAPS constant for use in other files
export const ABILITY_SCORE_CAPS = {
  MIN: 1,               // Minimum ability score
  MAX: 30,              // Theoretical maximum (gods/artifacts)
  DEFAULT: 10,          // Default starting value
  BASE_CAP: 20,         // Normal character maximum
  EPIC_CAP: 22,         // Epic level maximum (level 10+)
  LEGENDARY_CAP: 24     // Legendary maximum (level 16+)
};

// Export Character as both default and named export for compatibility
export default Character;
