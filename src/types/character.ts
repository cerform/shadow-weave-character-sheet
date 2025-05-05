
// Дополнение к существующему файлу, добавляем экспорт типа Character
export interface Character {
  id: string;
  name: string;
  race?: string;
  class?: string;
  level?: number;
  abilities?: {
    strength?: number;
    dexterity?: number;
    constitution?: number;
    intelligence?: number;
    wisdom?: number;
    charisma?: number;
  };
  hitPoints?: {
    current: number;
    max: number;
    temporary: number;
  };
  spells?: (string | CharacterSpell)[];
  spellSlots?: {
    [level: number]: {
      max: number;
      used: number;
    };
  };
  proficiencies?: string[] | {
    armor?: string[];
    weapons?: string[];
    tools?: string[];
    languages?: string[];
  };
  equipment?: string[] | {
    weapons?: string[];
    armor?: string;
    items?: string[];
  };
  [key: string]: any;
}

export interface CharacterSpell {
  id: string | number;
  name: string;
  level: number;
  school?: string;
  castingTime?: string;
  range?: string;
  components?: string;
  duration?: string;
  description: string;
  prepared?: boolean;
}

export type CharacterSheet = Character;
