
export const ABILITY_SCORE_CAPS = {
  BASE_CAP: 20,      // Standard cap for most characters
  EPIC_CAP: 22,      // Cap for characters level 10-15
  LEGENDARY_CAP: 24, // Cap for characters level 16+
  DEITY_CAP: 30      // Maximum possible value (for gods, etc)
};

export interface HitPointEvent {
  amount: number;
  type: 'damage' | 'healing' | 'temp';
  source?: string;
  timestamp: string;
}

export interface Character {
  // Basic info
  id?: string;
  userId?: string;
  name: string;
  class: string;
  level: number;
  race: string;
  subrace?: string;
  subclass?: string;
  background: string;
  alignment: string;
  
  // Ability scores - multiple formats for backward compatibility
  abilities?: {
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
  };
  
  stats?: {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
  };
  
  // Direct ability scores
  strength?: number;
  dexterity?: number;
  constitution?: number;
  intelligence?: number;
  wisdom?: number;
  charisma?: number;
  
  // Additional character stats
  abilityPointsUsed?: number;
  proficiencyBonus?: number;
  armorClass?: number;
  initiative?: number;
  speed?: number;
  
  // Hit points and hit dice
  hp?: {
    current: number;
    max: number;
    temp: number;
  };
  
  hitDice?: {
    total: number;
    value: number;
    used?: number;
  };
  
  hpHistory?: HitPointEvent[];
  
  // Proficiencies
  proficiencies?: {
    languages: string[];
    tools: string[];
    weapons: string[];
    armor: string[];
    skills?: string[];
  };
  
  savingThrows?: Record<string, boolean>;
  skills?: Record<string, boolean> | Record<string, { proficient: boolean; expertise?: boolean; }>;
  skillBonuses?: Record<string, number>;
  
  // Equipment
  equipment?: string[];
  items?: Array<{
    id?: string;
    name: string;
    quantity: number;
    type?: string;
    description?: string;
    weight?: number;
    value?: number;
  }>;
  gold?: number;
  
  // Magic
  spellcasting?: {
    ability?: string;
    saveDC?: number;
    attackBonus?: number;
    preparedSpellsLimit?: number;
  };
  spells?: any[];
  ritual?: boolean;
  
  // Character flavor
  personalityTraits?: string;
  ideals?: string;
  bonds?: string;
  flaws?: string;
  features?: any[];
  
  // Additional info
  backstory?: string;
  notes?: string;
  avatarUrl?: string;
  
  // Multiclassing
  additionalClasses?: {
    className: string;
    level: number;
    subclass?: string;
  }[];
  
  // Character management
  createdAt?: string;
  updatedAt?: string;
}
