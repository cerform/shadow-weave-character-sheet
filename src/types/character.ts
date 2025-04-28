
export interface CharacterData {
  id?: string | number;
  name: string;
  race: string;
  subrace?: string;
  class: string;
  subclass?: string;
  level: number;
  background?: string;
  alignment?: string;
  abilities: {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
  };
  personalityTraits?: string;
  ideals?: string;
  bonds?: string;
  flaws?: string;
  appearance?: string;
  backstory?: string;
  createdAt?: string;
  [key: string]: any; // For any additional properties
}
