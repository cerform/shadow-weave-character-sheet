
export interface Character {
  id: string;
  userId: string;
  name: string;
  race: string;
  class: string;
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
  currentHp: number;
  temporaryHp: number;
  hitDice: {
    total: number;
    used: number;
    type: string;
    dieType?: string; // Добавляем поддержку dieType
  };
  deathSaves: {
    successes: number;
    failures: number;
  };
  inspiration: boolean;
  conditions: string[]; // Добавляем поле conditions
  inventory: any[];
  equipment: any[];
  spells: CharacterSpell[];
  proficiencies: string[];
  features: CharacterFeature[];
  notes: string;
  resources: {
    [key: string]: {
      max: number;
      used: number;
      name?: string;
      shortRestRecover?: boolean;
      longRestRecover?: boolean;
      recoveryType?: string; // Добавляем поле recoveryType
    };
  };
  savingThrowProficiencies: string[];
  skillProficiencies: string[];
  expertise: string[];
  skillBonuses: {
    [key: string]: number;
  };
  spellcasting: {
    ability?: string;
    saveDC?: number; // Добавляем поддержку saveDC
    attackBonus?: number; // Добавляем поддержку attackBonus
  };
  gold: number;
  initiative: number;
  lastDiceRoll: DiceResult;
  languages: string[];
  subrace?: string; // Добавляем поле subrace
}

export interface CharacterSpell {
  id?: string | number;
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
