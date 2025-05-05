
export interface CharacterAbilities {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
}

export interface Skill {
  name: string;
  ability: keyof CharacterAbilities;
  proficient: boolean;
  expertise: boolean;
  bonus?: number;
}

export interface SavingThrow {
  ability: keyof CharacterAbilities;
  proficient: boolean;
  bonus?: number;
}

export interface CharacterProficiencies {
  armor?: string[];
  weapons?: string[];
  tools?: string[];
  languages?: string[];
}

export interface CharacterSpell {
  id?: number;
  name: string;
  level: number;
  prepared: boolean;
  description?: string;
  school?: string;
  castingTime?: string;
  range?: string;
  components?: string;
  duration?: string;
  verbal?: boolean;
  somatic?: boolean;
  material?: boolean;
  materialComponents?: string;
  ritual?: boolean;
  concentration?: boolean;
  higherLevels?: string;
  classes?: string[] | string;
}

export interface SpellSlots {
  [level: string]: {
    max: number;
    used: number;
  };
}

export interface Character {
  id: string;
  userId?: string;
  name: string;
  class: string;
  level: number;
  race: string;
  background?: string;
  alignment?: string;
  experience?: number;
  abilities?: CharacterAbilities;
  proficiencyBonus?: number;
  hitPoints?: {
    max: number;
    current: number;
    temporary: number;
  };
  armorClass?: number;
  initiative?: number;
  speed?: number;
  skills?: Skill[];
  savingThrows?: SavingThrow[];
  proficiencies?: CharacterProficiencies;
  feats?: string[];
  equipment?: { name: string; quantity: number }[];
  spells?: CharacterSpell[];
  spellSlots?: SpellSlots;
  backstory?: string;
  features?: { name: string; description: string }[];
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  languages?: string[];
  displayName?: string;
  inspiration?: boolean;  // Added inspiration property
}

export interface CharacterSheet extends Character {
  // Additional properties for character sheet if needed
}
