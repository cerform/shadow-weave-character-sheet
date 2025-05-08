
interface Character {
  id: string;
  name: string;
  race: string;
  subrace?: string;
  class: string;
  subclass?: string;
  background: string;
  alignment: string;
  level: number;
  xp: number;
  abilities: AbilityScores;
  savingThrows: AbilityScores;
  skills: Record<string, { proficient: boolean; expertise: boolean; value: number }>;
  hp: number;
  maxHp: number;
  temporaryHp: number; 
  ac: number;
  proficiencyBonus: number;
  speed: number;
  initiative: number; 
  inspiration: boolean;
  hitDice: {
    total: number;
    used: number;
    dieType: string;
  };
  resources: Record<string, {
    max: number;
    used: number;
    name: string;
    recoveryType?: 'short-rest' | 'long-rest' | 'short' | 'long';
  }>;
  deathSaves: {
    successes: number;
    failures: number;
  };
  spellcasting: {
    ability: string;
    dc: number;
    attack: number;
  };
  spellSlots: Record<string, { max: number; used: number }>;
  sorceryPoints?: {
    max: number;
    current?: number;
    used?: number;
  }; 
  spells: CharacterSpell[];
  equipment: {
    weapons: string[];
    armor: string;
    items: string[];
    gold: number;
  };
  proficiencies: {
    languages: string[];
    tools: string[];
    weapons?: string[];
    armor?: string[];
    skills?: string[];
  };
  features: Feature[];
  notes: string;
  lastDiceRoll?: {
    type: string;
    result: number | number[];
    modifier: number;
    total: number;
    advantage?: boolean;
    disadvantage?: boolean;
    timestamp: number;
  };
  // Add properties that were missing or needed across multiple components
  currentHp?: number;
  gender?: string;
}

export default Character;
