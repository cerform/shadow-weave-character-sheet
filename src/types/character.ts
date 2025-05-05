
export interface Character {
  id: string;
  name: string;
  race: string;
  subrace?: string;
  class: string;
  level: number;
  background?: string;
  alignment?: string;
  experience: number;
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
  maxHp: number;
  currentHp: number;
  temporaryHp?: number;
  armorClass?: number;
  initiative?: string;
  speed?: string;
  inspiration?: boolean;
  proficiencyBonus?: number;
  skills?: { [key: string]: number | boolean | { proficient: boolean; expertise: boolean; bonus?: number } };
  savingThrows?: { [key: string]: boolean };
  equipment?: string[] | { weapons?: string[]; armor?: string; items?: string[] };
  features?: string[];
  spells?: any[];
  notes?: string;
  proficiencies?: string[];
  languages?: string[];
  gold?: number;
  backstory?: string;
  hitDice?: { total: number; used: number; dieType: string; value: string };
  deathSaves?: { successes: number; failures: number };
  resources?: { [key: string]: { total: number; used: number; name: string } };
  lastDiceRoll?: {
    diceType: string;
    count: number;
    modifier: number;
    rolls: number[];
    total: number;
    label: string;
    timestamp: string;
  };
}

export interface CharacterSpell {
  name: string;
  level: number;
  prepared?: boolean;
  castingTime?: string;
  range?: string;
  components?: string;
  duration?: string;
  school?: string;
  description?: string;
  classes?: string[] | string;
  source?: string;
}
