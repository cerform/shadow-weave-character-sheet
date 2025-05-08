
export interface Character {
  id: string;
  name?: string;
  class?: string;
  className?: string;
  race?: string;
  level?: number;
  background?: string;
  subclass?: string;
  alignment?: string;
  experience?: number;
  strength?: number;
  dexterity?: number;
  constitution?: number;
  intelligence?: number;
  wisdom?: number;
  charisma?: number;
  maxHp?: number;
  currentHp?: number;
  temporaryHp?: number;
  stats?: {
    strength?: number;
    dexterity?: number;
    constitution?: number;
    intelligence?: number;
    wisdom?: number;
    charisma?: number;
  };
  proficiencyBonus?: number;
  armorClass?: number;
  initiative?: number;
  speed?: number;
  hitDice?: string;
  spells?: any[];
  equipment?: any[];
  features?: any[];
  proficiencies?: any;
  languages?: string[];
  savingThrows?: string[];
  skills?: any[];
  traits?: any[];
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
  hitPoints?: {
    maximum?: number;
    current?: number;
    temporary?: number;
  };
  lastDiceRoll?: DiceResult;
}

export interface Item {
  id?: string;
  name: string;
  quantity?: number;
  weight?: number;
  value?: number;
  description?: string;
  type?: string;
  equipped?: boolean;
  properties?: string[];
}

export interface DiceResult {
  formula: string;
  total: number;
  rolls: number[];
  modifier?: number;
  timestamp: number;
  description?: string;
  success?: boolean;
}

export interface HitPointEvent {
  type: 'damage' | 'healing' | 'temp';
  value: number;
  source?: string;
  timestamp: number;
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
  ritual?: boolean;
  concentration?: boolean;
  classes?: string[] | string;
  source?: string;
}
