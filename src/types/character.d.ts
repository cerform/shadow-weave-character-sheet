export interface CharacterSpell {
  name: string;
  level: number;
  school: string;
  castingTime: string;
  range: string;
  components: string;
  duration: string;
  description: string;
  higherLevels?: string;
  classes: string[];
  ritual?: boolean;
  concentration?: boolean;
}

// Adding the CharacterSheet interface for use in useCharacterCreation and the PDF generator
export interface CharacterSheet {
  name: string;
  race: string;
  subrace?: string; // Добавляем опциональное поле subrace
  class: string;
  subclass?: string;
  level: number;
  background: string;
  alignment: string;
  abilities: {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
  };
  skills: string[];
  languages: string[];
  equipment: string[];
  spells: string[];
  proficiencies: string[];
  features: string[];
  personalityTraits: string;
  ideals: string;
  bonds: string;
  flaws: string;
  appearance: string;
  backstory: string;
}

// Интерфейс для подклассов персонажей
export interface CharacterSubclass {
  name: string;
  className: string;
  description: string;
  features: {
    level: number;
    name: string;
    description: string;
  }[];
}
