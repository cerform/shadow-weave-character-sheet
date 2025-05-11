

export interface Character {
  name: string;
  class: string;
  level: number;
  race: string;
  background: string;
  alignment: string;
  abilities: {
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
  };
  maxHp: number;
  currentHp: number;
  tempHp?: number;
  temporaryHp?: number;  // Добавлено для совместимости
  armorClass: number;
  proficiencyBonus: number;
  speed: number;
  equipment: any[];
  features: any[];
  spells: (CharacterSpell | string)[];
  proficiencies: {
    languages: string[];
    tools: string[];
    weapons: string[];
    armor: string[];
    skills?: string[];
  };
  hitDice?: {
    total: number;
    used: number;
    dieType: string;
    value: string;
  };
  money: {
    cp: number;
    sp: number;
    ep: number;
    gp: number;
    pp: number;
  };
  deathSaves: {
    successes: number;
    failures: number;
  };
  gender?: string;
  personalityTraits?: string;
  ideals?: string;
  bonds?: string;
  flaws?: string;
  backstory?: string;
  initiative?: number;
  spellSlots?: Record<string, { max: number; used: number }>;
  resources?: Record<string, { max: number; used: number; recoveryType?: 'short' | 'short-rest' | 'long' | 'long-rest' }>;
  sorceryPoints?: {
    max: number;
    current: number;
  };
  lastDiceRoll?: {
    diceType: string;
    count: number;
    modifier: number;
    rolls: number[];
    total: number;
    label: string;
    timestamp: string;
  };
  notes?: string;
  spellcasting?: {
    ability: string;
    saveDC: number;
    attackBonus: number;
  };
}

export interface CharacterSpell {
  id?: string | number;
  name: string;
  level: number;
  school?: string;
  castingTime?: string;
  range?: string;
  components?: string;
  duration?: string;
  description?: string | string[];
  classes?: string[] | string;
  ritual?: boolean;
  concentration?: boolean;
  verbal?: boolean;
  somatic?: boolean;
  material?: boolean;
  materials?: string;
  prepared?: boolean;
  source?: string;
  higher_level?: string;
  higherLevel?: string;
  higherLevels?: string;
}

