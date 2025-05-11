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
  temporaryHp?: number;  // Added for compatibility
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
    skills?: string[];  // Added missing property
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
  initiative?: number;  // Added missing property
  spellSlots?: Record<string, { max: number; used: number }>;
  resources?: Record<string, { max: number; used: number }>;  // Added missing property
  sorceryPoints?: {     // Added missing property
    max: number;
    current: number;
  };
  lastDiceRoll?: {      // Added missing property
    diceType: string;
    count: number;
    modifier: number;
    rolls: number[];
    total: number;
    label: string;
    timestamp: string;
  };
  notes?: string;       // Added missing property
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
