
export const ABILITY_SCORE_CAPS = {
  MIN: 1,
  MAX: 30
};

export interface HitPointEvent {
  type: 'damage' | 'healing' | 'temp';
  value: number;
  source?: string;
  timestamp?: string;
}

export interface Character {
  id?: string;
  name: string;
  class: string;
  level: number;
  race: string;
  subrace?: string;
  subclass?: string;
  background: string;
  alignment: string;
  abilities: {
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
  stats: {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
  };
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
  proficiencies: {
    languages: string[];
    tools: string[];
    weapons: string[];
    armor: string[];
    skills: string[];
  };
  equipment: any[];
  gold: number;
  hp: {
    current: number;
    max: number;
    temp: number;
  };
  currentHp?: number;  // For compatibility
  maxHp?: number;      // For compatibility
  tempHp?: number;     // For compatibility
  temporaryHp?: number; // For compatibility
  hitPoints?: number;   // For compatibility
  spellcasting: any | null;
  spells: any[];
  features: any[];
  proficiencyBonus: number;
  armorClass: number;
  initiative: number;
  speed: number;
  hitDice: {
    total: number;
    value: number;
  };
  savingThrows: {
    strength: boolean;
    dexterity: boolean;
    constitution: boolean;
    intelligence: boolean;
    wisdom: boolean;
    charisma: boolean;
  };
  skills: Record<string, boolean>;
  personalityTraits: string;
  ideals: string;
  bonds: string;
  flaws: string;
  backstory: string;
  updatedAt: string;
  createdAt?: string;
  className?: string;  // For compatibility
  gender?: string;     // Added for basic info
  experience?: number; // For character progression
  additionalClasses?: {
    class: string;
    level: number;
    subclass?: string;
  }[];
}

export interface CharacterSpell {
  id?: string | number;
  name: string;
  level: number;
  school?: string;
  castingTime?: string;
  range?: string;
  components?: string;
  duration?: string;
  description?: string | string[];
  classes?: string[] | string;
  ritual?: boolean;
  concentration?: boolean;
  verbal?: boolean;
  somatic?: boolean;
  material?: boolean;
  materials?: string;
  prepared?: boolean;
  source?: string;
}
