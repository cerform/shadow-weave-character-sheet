
export interface CharacterSpell {
  name: string;
  level: number;
  school?: string;
  castingTime?: string;
  range?: string;
  components?: string;
  duration?: string;
  description?: string;
  classes?: string | string[];
  prepared?: boolean;
  verbal?: boolean;
  somatic?: boolean;
  material?: boolean;
  materialComponents?: string;
  ritual?: boolean;
  concentration?: boolean;
}

export interface DiceResult {
  dice: string;
  result: number;
  rolls: number[];
  modifier?: number;
  nickname?: string;
}

export interface SpellFilter {
  name: string;
  level: number[];
  school: string[];
  class: string[];
  castingTime: string[];
  ritual: boolean | null;
  concentration: boolean | null;
}
