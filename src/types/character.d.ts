
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
}

export interface SpellSlot {
  max: number;
  used: number;
}

export interface CharacterSpellSlots {
  [key: string]: SpellSlot;
}

// Add the Item interface that's missing
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

export interface Character {
  id?: string;
  name: string;
  race?: string;
  class?: string;
  background?: string;
  level?: number;
  experience?: number;
  alignment?: string;
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
  armorClass?: number;
  speed?: number;
  initiative?: number;
  proficiencyBonus?: number;
  skills?: CharacterSkills;
  savingThrows?: {
    [key: string]: boolean;
  };
  equipment?: string[];
  features?: string[];
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
  // Add missing properties
  className?: string;
  inventory?: Item[];
  proficiencies?: string[];
  resources?: any;
  savingThrowProficiencies?: string[];
  skillProficiencies?: string[];
  expertise?: string[];
  skillBonuses?: {[key: string]: number};
  spellcasting?: {ability?: string};
  gold?: number;
  initiative?: number;
  lastDiceRoll?: {formula: string; rolls: number[]; total: number};
  languages?: string[];
  maxHp?: number;
  currentHp?: number;
  temporaryHp?: number;
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
}
