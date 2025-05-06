
export interface ClassData {
  name: string;
  hitDice: number;
  primaryAbility: string[];
  savingThrows: string[];
  armorProficiencies: string[];
  weaponProficiencies: string[];
  toolProficiencies: string[];
  skillChoices: string[];
  skillCount: number;
  spellcasting?: {
    ability: string;
    spellSlots?: Record<number, number[]>;
  };
  subclasses?: Record<string, SubclassData>;
}

export interface SubclassData {
  name: string;
  description: string;
  features: Feature[];
}

export interface Feature {
  name: string;
  level: number;
  description: string;
}
