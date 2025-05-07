// Импортируем необходимые типы
import { Item } from './character';

export interface Character {
  id?: string;
  userId?: string;
  name: string;
  race: string;
  class: string;
  level: number;
  background: string;
  alignment: string;
  experience: number;
  armorClass: number;
  initiative: number;
  speed: number;
  hitPoints: number;
  abilities?: {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
  };
  skills?: string[];
  equipment?: Item[];
  spells?: CharacterSpell[];
  features?: string[];
  proficiencies?: string[];
  languages?: string[];
  notes?: string;
  age?: number;
  height?: string;
  weight?: string;
  eyes?: string;
  skin?: string;
  hair?: string;
  gender?: string;
  subrace?: string;
  maxHp?: number;
  currentHp?: number;
  stats?: {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
  };
  abilityBonuses?: Record<string, number>;
  selectedAbilities?: string[];
}

export interface Item {
  id: string;
  name: string;
  description?: string;
  quantity?: number;
  weight?: number;
  type?: string;
  value?: number;
  notes?: string;
  equipped?: boolean;
}

export interface CharacterSpell {
  id: string;
  name: string;
  level: number;
  school: string;
  castingTime: string;
  range: string;
  components: string;
  duration: string;
  description: string | string[];
  classes: string[] | string;
  ritual?: boolean;
  concentration?: boolean;
  verbal?: boolean;
  somatic?: boolean;
  material?: boolean;
  materials?: string;
  higherLevel?: string;
  higherLevels?: string;
  prepared?: boolean;
  source?: string;
}

// Интерфейс для деталей расы
export interface RaceDetails {
  name: string;
  description: string;
  abilityScoreIncrease: AbilityScoreIncrease;
  size: string;
  speed: number;
  languages: string[];
  traits: { name: string; description: string }[];
  vision: string;
  source: string;
  subraces?: (string | SubraceDetails)[];
}

// Интерфейс для деталей подрасы
export interface SubraceDetails {
  name: string;
  description: string;
  abilityScoreIncrease?: AbilityScoreIncrease;
  traits?: string[] | { name: string; description: string }[];
}

// Интерфейс для увеличения характеристик
export interface AbilityScoreIncrease {
  [key: string]: number | string | Record<string, number>;
  strength?: number;
  dexterity?: number;
  constitution?: number;
  intelligence?: number;
  wisdom?: number;
  charisma?: number;
  all?: number;
  custom?: number | string;
}
