
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
  proficiencies?: any[];
  languages?: string[];
  savingThrows?: string[];
  skills?: any[];
  traits?: any[];
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
}
