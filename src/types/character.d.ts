
export interface Character {
  id: string;
  userId?: string;
  name: string;
  race: string;
  class: string;
  className?: string; // Добавляем для совместимости с компонентами
  level: number;
  background: string;
  alignment: string;
  experience: number;
  abilities?: {
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
  };
  proficiencyBonus?: number;
  armorClass: number;
  maxHp: number;
  currentHp?: number; // Добавляем для HPBar компонента
  hp?: number; // Для обратной совместимости
  temporaryHp: number;
  hitDice: {
    total: number;
    used: number;
    type: string;
    dieType?: string;
  };
  hitPoints?: { // Для обратной совместимости
    maximum: number;
    current: number;
    temporary: number;
  };
  deathSaves?: {
    successes: number;
    failures: number;
  };
  inspiration?: boolean;
  conditions?: string[];
  inventory?: any[];
  equipment?: any[] | {
    weapons?: string[];
    tools?: string[];
    languages?: string[];
    armor?: string;
    items?: string[];
  };
  spells?: CharacterSpell[];
  proficiencies?: string[] | {
    weapons?: string[];
    tools?: string[];
    languages?: string[];
  };
  features?: CharacterFeature[] | {
    race: string[];
    class: string[];
    background: string[];
  };
  notes?: string;
  resources?: {
    [key: string]: {
      max: number;
      used: number;
      name?: string;
      shortRestRecover?: boolean;
      longRestRecover?: boolean;
      recoveryType?: string;
    };
  };
  savingThrowProficiencies?: string[];
  savingThrows?: {
    [key: string]: boolean;
  };
  skillProficiencies?: string[];
  skills?: {
    [key: string]: boolean | number | { value: number; bonus: number; };
  };
  expertise?: string[];
  skillBonuses?: {
    [key: string]: number;
  };
  spellcasting?: {
    ability?: string;
    saveDC?: number;
    attackBonus?: number;
  };
  spellcastingAbility?: string;
  spellSaveDC?: number;
  spellAttackBonus?: number;
  gold?: number;
  silver?: number;
  copper?: number;
  platinum?: number;
  electrum?: number;
  currency?: {
    cp?: number;
    sp?: number;
    ep?: number;
    gp?: number;
    pp?: number;
  };
  initiative?: number;
  speed?: string | number;
  lastDiceRoll?: DiceResult;
  languages?: string[];
  subrace?: string;
  spellSlots?: Record<number | string, { max: number; used: number; available?: number; }>;
  gender?: string;
  subclass?: string;
  abilityPointsUsed?: number;
  personalityTraits?: string;
  ideals?: string;
  bonds?: string;
  flaws?: string;
  backstory?: string;
  appearance?: string;
  stats?: {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
  };
  strength?: number;
  dexterity?: number;
  constitution?: number;
  intelligence?: number;
  wisdom?: number;
  charisma?: number;
  portrait?: string;
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
  prepared?: boolean;
  alwaysPrepared?: boolean;
  favorite?: boolean;
  tags?: string[];
  ritual?: boolean;
  concentration?: boolean;
  verbal?: boolean;
  somatic?: boolean;
  material?: boolean;
  materials?: string;
  higherLevel?: string;
  higherLevels?: string;
  source?: string;
  classes?: string[] | string;
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

export interface Item {
  name: string;
  quantity: number;
  type?: string;
  description?: string;
  weight?: number;
  cost?: number;
  properties?: string[];
}

export interface HitPointEvent {
  id: string;
  type: 'damage' | 'heal' | 'temp';
  amount: number;
  description?: string;
  timestamp: string;
}

export const ABILITY_SCORE_CAPS = {
  BASE_CAP: 20,        // Базовый максимум для характеристик
  EPIC_CAP: 22,        // Максимум для персонажей 10-15 уровня
  LEGENDARY_CAP: 24,   // Максимум для персонажей 16+ уровня
  ABSOLUTE_CAP: 30,    // Абсолютный максимум (только для особых случаев)
};
