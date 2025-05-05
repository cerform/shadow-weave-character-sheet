
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
  savingThrowProficiencies?: { [key: string]: boolean }; // Added for AbilitiesTab
  
  // Equipment and resources
  equipment?: { name: string; quantity: number }[] | string[];
  money?: Money;
  
  // Character details
  personality?: string;
  ideals?: string;
  bonds?: string;
  flaws?: string;
  backstory?: string;
  personalityTraits?: string; // Added for CharacterBackground
  appearance?: string; // Adding appearance field
  
  // Spellcasting
  spellcastingAbility?: string;
  spellSaveDC?: number;
  spellAttackBonus?: number;
  spells?: CharacterSpell[];
  spellSlots?: { [level: string]: { total: number; used: number; max: number } };
  
  // Features and traits
  features?: Feature[];
  racialFeatures?: Feature[];
  backgroundFeatures?: Feature[];
  feats?: Feature[]; // Added feats field
  
  // Meta properties
  image?: string;
  createdAt?: string;
  updatedAt?: string;
  userId?: string;
  
  // Custom fields
  notes?: string;
  sorceryPoints?: {
    current: number;
    max: number;
  };
  inspiration?: boolean;
  
  // Session specific
  isActive?: boolean;
  connectedToSession?: boolean;
  sessionId?: string;

  // Additional fields for character creation
  gender?: string;
  subrace?: string;
  subclass?: string;
  abilityPointsUsed?: number;
  stats?: {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
  };
  additionalClasses?: ClassLevel[];
  
  // Добавляем поле languages для устранения ошибки в useCharacterCreation
  languages?: string[];
}

// Константы для ограничения значений характеристик
export const ABILITY_SCORE_CAPS = {
  MIN: 3,
  MAX: 20,
  BASE_CAP: 20,
  EPIC_CAP: 22,
  LEGENDARY_CAP: 24
};

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
    max: number;
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
  id?: string | number;
  name: string;
  level: number;
  school: string;
  castingTime: string;
  range: string;
  components: string;
  duration: string;
  description: string;
  prepared?: boolean;
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
  id?: string | number; // Обновлено: теперь id может быть строкой или числом
}

// Define Hit Point Event for damage log
export interface HitPointEvent {
  type: "damage" | "healing" | "temporary" | "heal" | "tempHP" | "temp" | "death-save";
  value: number;
  amount?: number; // Added for backward compatibility
  source?: string;
  timestamp: Date | number;
  critical?: boolean;
  description?: string;
  id?: string;
}

// Define CharacterSheet type for compatibility with services
export type CharacterSheet = Character;

// Define ClassLevel for multiclassing
export interface ClassLevel {
  class: string;
  level: number;
  subclass?: string;
}

// Добавлены расширения для User
export interface User {
  id: string;
  email?: string;
  displayName?: string;
  photoURL?: string;
  emailVerified?: boolean;
  username?: string;
  isDM?: boolean;
  themePreference?: string;
}
