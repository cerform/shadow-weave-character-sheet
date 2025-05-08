
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
  temporaryHp: number; // Added temporaryHp
  ac: number;
  proficiencyBonus: number;
  speed: number;
  initiative: number; // Added initiative
  inspiration: boolean;
  hitDice: { // Added hitDice
    total: number;
    used: number;
    dieType: string;
  };
  resources: Record<string, { // Added resources
    max: number;
    used: number;
    name: string;
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
  sorceryPoints?: { // Added sorceryPoints
    max: number;
    used: number;
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
    skills?: string[]; // Added skills
  };
  features: Feature[];
  notes: string; // Added notes
  lastDiceRoll?: { // Added lastDiceRoll
    type: string;
    result: number | number[];
    modifier: number;
    total: number;
    advantage?: boolean;
    disadvantage?: boolean;
    timestamp: number;
  };
}

export default Character;
