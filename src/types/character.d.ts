export interface Character {
  id?: string;
  name: string;
  class: string;
  level: number;
  race: string;
  subrace?: string;
  subclass?: string;
  background: string;
  alignment: string;
  abilities: {
    STR: number;
    DEX: number;
    CON: number;
    INT: number;
    WIS: number;
    CHA: number;
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
  };
  // Добавляем прямые свойства для характеристик
  strength?: number;
  dexterity?: number;
  constitution?: number;
  intelligence?: number;
  wisdom?: number;
  charisma?: number;
  // Добавляем hitPoints для обратной совместимости
  hitPoints?: { 
    maximum: number; 
    current: number; 
    temporary?: number;
  };
  maxHp: number;
  currentHp: number;
  tempHp?: number;
  temporaryHp?: number;
  armorClass: number;
  proficiencyBonus: number;
  speed: number;
  equipment: any[];
  features: any[];
  spells: (CharacterSpell | string)[];
  proficiencies: {
    languages: string[];
    tools: string[];
    weapons: string[];
    armor: string[];
    skills?: string[];
  };
  hitDice?: {
    total: number;
    used: number;
    dieType: string;
    value: string;
  };
  money: {
    cp: number;
    sp: number;
    ep: number;
    gp: number;
    pp: number;
  };
  currency?: {
    cp: number;
    sp: number;
    ep: number;
    gp: number;
    pp: number;
  };
  deathSaves: {
    successes: number;
    failures: number;
  };
  gender?: string;
  personalityTraits?: string;
  ideals?: string;
  bonds?: string;
  flaws?: string;
  backstory?: string;
  initiative?: number;
  spellSlots?: Record<string, { 
    max: number; 
    used: number; 
    current?: number; 
  }>;
  resources?: Record<string, { 
    max: number; 
    used: number; 
    current?: number; 
    recoveryType?: 'short' | 'short-rest' | 'long' | 'long-rest' 
  }>;
  sorceryPoints?: {
    max: number;
    current: number;
  };
  lastDiceRoll?: {
    diceType: string;
    count: number;
    modifier: number;
    rolls: number[];
    total: number;
    label: string;
    timestamp: string;
  };
  notes?: string;
  spellcasting?: {
    ability: string;
    saveDC: number;
    attackBonus: number;
    preparedSpellsLimit?: number;
  };
  abilityPointsUsed?: number;
  userId?: string;
  stats?: {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
  };
  skills?: Record<string, boolean | number | { proficient: boolean; value?: number; bonus?: number }>;
  savingThrows?: Record<string, boolean>;
  languages?: string[];
  skill?: Record<string, boolean | { proficient: boolean }>;
  savingThrowProficiencies?: Record<string, boolean>;
  skillProficiencies?: Record<string, boolean>;
  expertise?: string[];
  appearance?: string;
  className?: string;
  inspiration?: boolean;
  ac?: number;
  experience?: number;
  
  // Добавляем свойства для разделения фичей по категориям
  raceFeatures?: any[];
  classFeatures?: any[];
  backgroundFeatures?: any[];
  feats?: any[];
  
  // Добавляем skillBonuses для кастомных бонусов навыков
  skillBonuses?: Record<string, number>;

  // Добавляем additionalClasses для мультиклассовых персонажей
  additionalClasses?: Array<{class: string, level: number, subclass?: string}>;
}

export interface CharacterSpell {
  id?: string | number;
  name: string;
  level: number;
  school?: string;
  castingTime?: string;
  range?: string;
  components?: string;
  duration?: string;
  description?: string | string[];
  classes?: string[] | string;
  ritual?: boolean;
  concentration?: boolean;
  verbal?: boolean;
  somatic?: boolean;
  material?: boolean;
  materials?: string;
  prepared?: boolean;
  source?: string;
  higher_level?: string;
  higherLevel?: string;
  higherLevels?: string;
}

// Экспортируем константу для лимитов характеристик
export const ABILITY_SCORE_CAPS = {
  BASE_CAP: 20,
  EPIC_CAP: 22,
  LEGENDARY_CAP: 24
};

// Экспортируем интерфейс для событий хит-поинтов с расширенным типом
export interface HitPointEvent {
  id?: string | number;
  type: 'damage' | 'healing' | 'temporary' | 'heal' | 'tempHP' | 'temp' | 'death-save';
  value: number;
  amount?: number;
  timestamp: string | number | Date;
  description?: string;
  source?: string;
}

// Add LevelFeature interface
export interface LevelFeature {
  id: string;
  level: number;
  name: string;
  description: string;
  type: 'subclass' | 'ability_increase' | 'extra_attack' | 'spell_level' | 'feature';
  class?: string;
  required?: boolean;
}

// Export for useLevelFeatures
export { LevelFeature };
