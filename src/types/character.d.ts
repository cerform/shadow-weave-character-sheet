
export interface CharacterAbilities {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
}

export interface CharacterSkills {
  [key: string]: boolean | number;
}

export interface CharacterSpell {
  id?: string;
  name: string;
  level?: number;
  school?: string;
  castingTime?: string;
  range?: string;
  components?: string;
  duration?: string;
  description?: string[] | string;
  classes?: string[] | string;
  prepared?: boolean;
  ritual?: boolean;
  concentration?: boolean;
  verbal?: boolean;
  somatic?: boolean;
  material?: boolean;
  materials?: string;
  source?: string;
  higherLevel?: string;
  alwaysPrepared?: boolean;
}

export interface SpellSlot {
  max: number;
  used: number;
  available?: number;
}

export interface CharacterSpellSlots {
  [key: string]: SpellSlot;
}

export interface Item {
  id?: string;
  name: string;
  type?: string;
  quantity?: number;
  weight?: number;
  description?: string;
  cost?: number;
  equipped?: boolean;
  properties?: string[];
  damage?: string;
  armorClass?: number;
  strengthRequired?: number;
  stealthDisadvantage?: boolean;
}

export interface DiceResult {
  formula: string;
  rolls: number[];
  total: number;
}

export interface HitPointEvent {
  id: string;
  type: 'damage' | 'healing' | 'temp';
  value: number;
  source?: string;
  timestamp: number;
}

export interface CharacterFeature {
  id?: string;
  name: string;
  source: string;
  description: string;
  level?: number;
}

export interface Character {
  id: string;
  name: string;
  race: string;
  subrace?: string;
  class: string;
  className?: string; // Альтернативное название класса
  level: number;
  background?: string;
  alignment?: string;
  experience?: number;
  abilities?: CharacterAbilities;
  strength?: number;
  dexterity?: number;
  constitution?: number;
  intelligence?: number;
  wisdom?: number;
  charisma?: number;
  hitPoints?: {
    max: number;
    current: number;
    temporary?: number;
  };
  maxHp?: number;
  currentHp?: number;
  temporaryHp?: number;
  armorClass?: number;
  speed?: number;
  initiative?: number;
  proficiencyBonus?: number;
  skills?: CharacterSkills;
  savingThrows?: {
    [key: string]: boolean;
  };
  savingThrowProficiencies?: string[];
  skillProficiencies?: string[];
  expertise?: string[];
  equipment?: string[];
  features?: {
    race: string[];
    class: string[];
    background: string[];
  } | string[];
  spells?: (CharacterSpell | string)[];
  spellSlots?: {
    [level: string]: SpellSlot;
  };
  notes?: string;
  currency?: {
    copper?: number;
    silver?: number;
    electrum?: number;
    gold?: number;
    platinum?: number;
  };
  copper?: number;
  silver?: number;
  gold?: number;
  platinum?: number;
  electrum?: number;
  description?: {
    appearance?: string;
    backstory?: string;
    traits?: string;
    ideals?: string;
    bonds?: string;
    flaws?: string;
  };
  userId?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  inventory?: Item[];
  proficiencies?: string[] | {
    weapons?: string[];
    tools?: string[];
    languages?: string[];
  };
  resources?: any;
  skillBonuses?: {[key: string]: number};
  spellcasting?: {ability?: string};
  lastDiceRoll?: DiceResult;
  languages?: string[];
  hitDice?: {
    total: number;
    used: number;
    type: string;
    dieType?: string;
  };
  deathSaves?: {
    successes: number;
    failures: number;
  };
  inspiration?: boolean;
  conditions?: string[];
  weapons?: Item[];
  armor?: Item[];
  tools?: Item[];
  gender?: string;
  subclass?: string;
  abilityPointsUsed?: number;
  hp?: number;
  personalityTraits?: string;
  ideals?: string;
  bonds?: string;
  flaws?: string;
  backstory?: string;
  spellcastingAbility?: string;
  spellSaveDC?: number;
  spellAttackBonus?: number;
}

// Добавляем константы для лимитов характеристик
export const ABILITY_SCORE_CAPS = {
  BASE_CAP: 20,        // Базовый максимум для характеристик
  EPIC_CAP: 22,        // Максимум для персонажей 10-15 уровня
  LEGENDARY_CAP: 24,   // Максимум для персонажей 16+ уровня
  ABSOLUTE_CAP: 30,    // Абсолютный максимум (только для особых случаев)
};
