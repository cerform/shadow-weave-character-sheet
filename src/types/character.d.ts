
// If this file doesn't exist, we'll create it with the necessary types
export interface Character {
  id: string;
  name: string;
  race: string;
  class?: string;
  className?: string; // For backward compatibility
  level: number;
  alignment?: string;
  background?: string;
  experiencePoints?: number;
  
  // Abilities - both short and long form for compatibility
  abilities: CharacterAbilities;
  STR?: number;
  DEX?: number;
  CON?: number;
  INT?: number;
  WIS?: number;
  CHA?: number;
  
  // Combat stats
  armorClass?: number;
  initiative?: number;
  speed?: number;
  maxHp?: number;
  currentHp?: number;
  temporaryHp?: number;
  hitDice?: HitDice[];
  deathSaves?: DeathSaves;
  
  // Skills and proficiencies
  proficiencies?: CharacterProficiencies;
  proficiencyBonus?: number;
  savingThrows?: { [key: string]: boolean };
  skills?: { [key: string]: SkillProficiency };
  
  // Equipment and resources
  equipment?: { name: string; quantity: number }[];
  money?: Money;
  
  // Character details
  personality?: string;
  ideals?: string;
  bonds?: string;
  flaws?: string;
  backstory?: string;
  
  // Spellcasting
  spellcastingAbility?: string;
  spellSaveDC?: number;
  spellAttackBonus?: number;
  spells?: CharacterSpell[];
  spellSlots?: SpellSlots;
  
  // Features and traits
  features?: Feature[];
  racialFeatures?: Feature[];
  backgroundFeatures?: Feature[];
  
  // Meta properties
  image?: string;
  createdAt?: string;
  updatedAt?: string;
  userId?: string;
  
  // Custom fields
  notes?: string;
  sorceryPoints?: number;
  inspiration?: boolean;
  
  // Session specific
  isActive?: boolean;
  connectedToSession?: boolean;
  sessionId?: string;
}

// Define Character abilities
export interface CharacterAbilities {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
  
  // Short forms for backward compatibility
  STR?: number;
  DEX?: number;
  CON?: number;
  INT?: number;
  WIS?: number;
  CHA?: number;
}

// Define Death Saves tracking
export interface DeathSaves {
  successes: number;
  failures: number;
}

// Define Money tracking
export interface Money {
  copper?: number;
  silver?: number;
  electrum?: number;
  gold?: number;
  platinum?: number;
}

// Define Hit Dice
export interface HitDice {
  diceType: string;
  total: number;
  used: number;
}

// Define Spell Slots
export interface SpellSlots {
  [level: string]: {
    total: number;
    used: number;
  };
}

// Define Character Proficiencies
export interface CharacterProficiencies {
  weapons?: string[];
  armor?: string[];
  tools?: string[];
  languages?: string[];
  saves?: string[];
  skills?: string[];
}

// Define Features
export interface Feature {
  name: string;
  description: string;
  source?: string;
  level?: number;
}

// Define Skill Proficiency levels
export interface SkillProficiency {
  isProficient: boolean;
  isExpertise?: boolean;
  modifier?: number;
}

// Define Spell Data structure
export interface SpellData {
  id?: number;
  name: string;
  level: number;
  school: string;
  castingTime: string;
  range: string;
  components: string;
  duration: string;
  description: string;
  prepared: boolean;
  verbal?: boolean;
  somatic?: boolean;
  material?: boolean;
  materialComponents?: string;
  ritual?: boolean;
  concentration?: boolean;
  higherLevels?: string;
  classes?: string[] | string;
}

// Define Character Spell structure
export interface CharacterSpell extends SpellData {
  prepared: boolean;
}

// Define Hit Point Event for damage log
export interface HitPointEvent {
  type: "damage" | "healing" | "temporary";
  value: number;
  source?: string;
  timestamp: Date | number;
  critical?: boolean;
  description?: string;
}

// Define CharacterSheet type for compatibility with services
export type CharacterSheet = Character;
