
export interface CharacterAbilities {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
  STR?: number;
  DEX?: number;
  CON?: number;
  INT?: number;
  WIS?: number;
  CHA?: number;
}

export interface Skill {
  name: string;
  ability: keyof CharacterAbilities;
  proficient: boolean;
  expertise: boolean;
  bonus?: number;
}

export interface SavingThrow {
  ability: keyof CharacterAbilities;
  proficient: boolean;
  bonus?: number;
}

export interface CharacterProficiencies {
  armor?: string[];
  weapons?: string[];
  tools?: string[];
  languages?: string[];
}

export interface CharacterSpell {
  id?: number;
  name: string;
  level: number;
  prepared: boolean;
  description?: string;
  school?: string;
  castingTime?: string;
  range?: string;
  components?: string;
  duration?: string;
  verbal?: boolean;
  somatic?: boolean;
  material?: boolean;
  materialComponents?: string;
  ritual?: boolean;
  concentration?: boolean;
  higherLevels?: string;
  classes?: string[] | string;
}

export interface SpellSlots {
  [level: string]: {
    max: number;
    used: number;
  };
}

// Add interface for ClassLevel to support multiclassing
export interface ClassLevel {
  class: string;
  level: number;
  subclass?: string;
}

export interface HitPointEvent {
  id?: string;
  amount: number;
  type: 'damage' | 'healing' | 'temporary' | 'heal' | 'tempHP' | 'temp' | 'death-save';
  source?: string;
  timestamp: number | Date;
}

// Интерфейс для очков чародейства
export interface SorceryPoints {
  max: number;
  current: number;
}

// Constants for ability score caps at different levels
export const ABILITY_SCORE_CAPS = {
  BASE_CAP: 20,
  EPIC_CAP: 22,
  LEGENDARY_CAP: 24
};

export interface Character {
  id: string;
  userId?: string;
  name: string;
  class: string;
  level: number;
  race: string;
  subrace?: string;
  background?: string;
  alignment?: string;
  experience?: number;
  abilities?: CharacterAbilities;
  proficiencyBonus?: number;
  hitPoints?: {
    max: number;
    current: number;
    temporary: number;
  };
  maxHp?: number;
  currentHp?: number;
  temporaryHp?: number;
  hitDice?: {
    total: number;
    used: number;
    size: string;
  };
  armorClass?: number;
  initiative?: number;
  speed?: number;
  skills?: Skill[];
  savingThrows?: SavingThrow[];
  proficiencies?: CharacterProficiencies;
  feats?: string[];
  equipment?: { name: string; quantity: number }[] | string[];
  spells?: CharacterSpell[];
  spellSlots?: SpellSlots;
  backstory?: string;
  features?: { name: string; description: string }[];
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  languages?: string[];
  displayName?: string;
  inspiration?: boolean;
  gender?: string;
  personalityTraits?: string;
  ideals?: string;
  bonds?: string;
  flaws?: string;
  appearance?: string;
  subclass?: string;
  className?: string;
  additionalClasses?: ClassLevel[];
  // Добавляем точки чародейства
  sorceryPoints?: SorceryPoints;
  // Добавляем поле для отслеживания использованных очков характеристик
  abilityPointsUsed?: number;
  // Поля для спасбросков
  savingThrowProficiencies?: Record<string, boolean>;
  // Навыки
  skillProficiencies?: Record<string, boolean>;
  // For backward compatibility with existing code
  stats?: {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
  };
}

export interface CharacterSheet extends Character {
  // Additional properties for character sheet if needed
}

// Adding a SpellData type for compatibility with SpellBookViewer
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
  verbal?: boolean;
  somatic?: boolean;
  material?: boolean;
  materialComponents?: string;
  ritual?: boolean;
  concentration?: boolean;
  higherLevels?: string;
  classes?: string[] | string;
  prepared?: boolean;
}
