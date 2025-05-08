
export interface Character {
  id: string;
  userId: string;
  name: string;
  race: string;
  class: string;
  className?: string; // Added for compatibility with components expecting className
  level: number;
  background: string;
  alignment: string;
  experience: number;
  abilities: {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
    STR: number;
    DEX: number;
    CON: number;
    INT: number;
    WIS: number;
    CHA: number;
  };
  proficiencyBonus: number;
  armorClass: number;
  maxHp: number;
  currentHp: number; // Added for HPBar component
  temporaryHp: number;
  hitDice: {
    total: number;
    used: number;
    type: string;
    dieType?: string;
  };
  hitPoints?: { // Add for backward compatibility
    maximum: number;
    current: number;
    temporary: number;
  };
  deathSaves: {
    successes: number;
    failures: number;
  };
  inspiration: boolean;
  conditions: string[];
  inventory: any[];
  equipment: any[] | Item[];
  spells: CharacterSpell[];
  proficiencies: string[] | {
    weapons?: string[];
    tools?: string[];
    languages?: string[];
  };
  features: CharacterFeature[];
  notes: string;
  resources: {
    [key: string]: {
      max: number;
      used: number;
      name?: string;
      shortRestRecover?: boolean;
      longRestRecover?: boolean;
      recoveryType?: string;
    };
  };
  savingThrowProficiencies: string[];
  skillProficiencies: string[];
  skills?: {
    [key: string]: number | { value: number; bonus: number; };
  };
  expertise: string[];
  skillBonuses: {
    [key: string]: number;
  };
  spellcasting: {
    ability?: string;
    saveDC?: number;
    attackBonus?: number;
  };
  gold: number;
  initiative: number;
  speed?: string | number;
  lastDiceRoll: DiceResult;
  languages: string[];
  subrace?: string;
  spellSlots?: Record<number | string, { max: number; used: number; available?: number; }>;
}

export interface CharacterSpell {
  id: string | number;
  name: string;
  level: number;
  school: string;
  castingTime: string;
  range: string;
  components: string;
  duration: string;
  description: string | string[];
  prepared: boolean;
  favorite?: boolean;
  tags?: string[];
  verbal?: boolean;
  somatic?: boolean;
  material?: boolean;
  materials?: string;
  higherLevel?: string;
  higherLevels?: string;
  source?: string;
  classes?: string[] | string;
  ritual?: boolean;
  concentration?: boolean;
}

export interface CharacterFeature {
  name: string;
  source: string;
  description: string;
  level?: number;
  uses?: number;
  maxUses?: number;
  rechargeOn?: 'short' | 'long' | 'daily' | 'other';
}

export interface DiceResult {
  formula: string; // Например: "1d20+5"
  rolls: number[];
  total: number;
  diceType?: string; // Обратная совместимость
  count?: number; // Обратная совместимость
  modifier?: number; // Обратная совместимость
  label?: string;
  timestamp?: string;
  nickname?: string;
  result?: number;
  reason?: string;
}

// Add the Item interface referenced in several components
export interface Item {
  name: string;
  quantity: number;
  type?: string;
  description?: string;
  weight?: number;
  cost?: number;
  properties?: string[];
}

// Add the HitPointEvent interface for DamageLog.tsx
export interface HitPointEvent {
  id: string;
  type: 'damage' | 'heal' | 'temp';
  amount: number;
  description?: string;
  timestamp: string;
}

// Export ABILITY_SCORE_CAPS constants for CharacterLevelSelection
export const ABILITY_SCORE_CAPS = {
  BASE_CAP: 20,        // Базовый максимум для характеристик
  EPIC_CAP: 22,        // Максимум для персонажей 10-15 уровня
  LEGENDARY_CAP: 24,   // Максимум для персонажей 16+ уровня
  ABSOLUTE_CAP: 30,    // Абсолютный максимум (только для особых случаев)
};
