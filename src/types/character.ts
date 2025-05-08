
import { CharacterSpell } from './spells';

export interface HitPointEvent {
  type: 'damage' | 'healing' | 'temp' | 'max';
  value: number;
  source?: string;
  timestamp: number;
}

export interface Character {
  id: string;
  name: string;
  race: string;
  class: string;
  level: number;
  background: string;
  alignment: string;
  experience: number;
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
  hp: number;
  maxHp: number;
  temporaryHp: number;
  hitDice: { total: number; used: number; type: string; dieType?: string; };
  proficiencyBonus: number;
  proficiencies: string[];
  skills: Record<string, boolean>;
  savingThrows: Record<string, boolean>;
  armorClass: number;
  initiative: number;
  speed: number;
  equipment: any[];
  features: string[];
  description: string;
  personalityTraits: string;
  ideals: string;
  bonds: string;
  flaws: string;
  backstory: string;
  spells: (CharacterSpell | string)[];
  abilities: {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number; 
    wisdom: number;
    charisma: number;
  };
  raceFeatures?: (string | { name: string; description: string; level: number; })[];
  classFeatures?: (string | { name: string; description: string; level: number; })[];
  backgroundFeatures?: (string | { name: string; description: string; level: number; })[];
  feats?: (string | { name: string; description: string; level: number; })[];
  expertise?: string[];
  skillBonuses?: Record<string, number>;
  appearance?: string;
  currency?: {
    cp?: number;
    sp?: number;
    gp?: number;
    pp?: number;
    ep?: number;
  };
}
