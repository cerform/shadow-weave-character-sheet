// Ability Scores interface
export interface AbilityScores {
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
}

// Character Spell interface
export interface CharacterSpell {
  id: string;
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
  higherLevel?: string;
  higherLevels?: string;
  ritual?: boolean;
  concentration?: boolean;
  materials?: string;
}

// Main Character interface
export interface Character {
  id: string;
  name: string;
  race: string;
  subrace?: string;
  class: string;
  subclass?: string;
  level: number;
  background?: string;
  alignment?: string;
  experience?: number;
  
  // Core stats
  abilities?: AbilityScores;
  proficiencyBonus?: number;
  armorClass?: number;
  initiative?: number;
  speed?: number;
  maxHitPoints?: number;
  currentHitPoints?: number;
  temporaryHitPoints?: number;
  
  // Hit Dice
  hitDice?: {
    value: string;
    total?: number;
    remaining?: number;
  };
  
  // Combat stats
  attackBonus?: number;
  savingThrows?: Record<string, number>;
  skills?: Record<string, any>;
  
  // Equipment
  inventory?: any[];
  equipment?: any[];
  weapons?: any[];
  armor?: any[];
  
  // Magic
  spellcasting?: {
    ability: string;
    saveDC?: number;
    attackBonus?: number;
  };
  spells?: (CharacterSpell | string)[];
  spellSlots?: Record<string, { max: number; used: number }>;
  
  // Features
  features?: any[];
  traits?: any[];
  proficiencies?: {
    languages?: string[];
    tools?: string[];
    weapons?: string[];
    armor?: string[];
    skills?: string[];
  };
  
  // Personal details
  appearance?: string;
  backstory?: string;
  personality?: {
    traits?: string;
    ideals?: string;
    bonds?: string;
    flaws?: string;
  };
  
  // Notes
  notes?: string;
  
  // Metadata
  createdAt?: string;
  updatedAt?: string;
  lastUsed?: string;
  
  // Other details as needed
  [key: string]: any;
}

export default Character;
