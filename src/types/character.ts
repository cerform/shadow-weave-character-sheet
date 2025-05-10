// Define Character interface
export interface Character {
  id: string;
  name: string;
  race: string;
  subrace?: string;
  class: string;
  className?: string; // Альтернативное имя для class
  subclass?: string;
  background: string;
  alignment: string;
  level: number;
  xp: number;
  experience?: number; // Альтернативное имя для xp
  
  // Основные характеристики - доступны как properties самого объекта и внутри объектов abilities/stats
  strength?: number;
  dexterity?: number;
  constitution?: number;
  intelligence?: number;
  wisdom?: number;
  charisma?: number;
  
  // Два формата для характеристик - обеспечивает обратную совместимость
  abilities: AbilityScores;
  stats?: {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
    [key: string]: number;
  };
  
  // Сохранение и навыки
  savingThrows: AbilityScores;
  skills: Record<string, { proficient: boolean; expertise: boolean; value: number }>;
  savingThrowProficiencies?: string[]; // Список умений с владением спасброском
  skillProficiencies?: string[]; // Список навыков с владением
  expertise?: string[]; // Список навыков с экспертизой
  skillBonuses?: Record<string, number>; // Бонусы для навыков
  
  // Здоровье и защита
  hp: number;
  maxHp: number;
  currentHp?: number;
  temporaryHp: number;
  armorClass?: number; // Альтернатива для ac
  ac: number;
  
  // Боевые характеристики
  proficiencyBonus: number;
  speed: number;
  initiative: number;
  inspiration: boolean;
  hitDice: {
    total: number;
    used: number;
    dieType: string;
  };
  
  // Ресурсы персонажа (очки действий, силы, рейджи и т.д.)
  resources: Record<string, {
    max: number;
    used: number;
    name: string;
    recoveryType?: 'short-rest' | 'long-rest' | 'short' | 'long';
  }>;
  
  // Спасброски от смерти
  deathSaves: {
    successes: number;
    failures: number;
  };
  
  // Магические параметры
  spellcasting?: {
    ability: string;
    dc: number;
    attack: number;
    preparedSpellsLimit?: number;
  };
  spellSlots?: Record<string, { max: number; used: number }>;
  sorceryPoints?: {
    max: number;
    current?: number;
    used?: number;
  };
  
  // Коллекции и инвентарь
  spells: (CharacterSpell | string)[];
  equipment: {
    weapons: string[];
    armor: string;
    items: string[];
    gold: number;
  } | string[] | Item[];
  
  // Владение и знания
  proficiencies: {
    languages: string[];
    tools: string[];
    weapons?: string[];
    armor?: string[];
    skills?: string[];
  };
  languages?: string[]; // Для обратной совместимости
  
  // Особенности
  features: (Feature | string)[];
  notes?: string;
  
  // Информация о последнем броске кубиков
  lastDiceRoll?: {
    type: string;
    result: number | number[];
    modifier: number;
    total: number;
    advantage?: boolean;
    disadvantage?: boolean;
    timestamp: number;
    diceType?: string;
    count?: number;
    rolls?: number[];
    label?: string;
  };
  
  // Дополнительные данные персонажа
  gender?: string;
  additionalClasses?: {
    class: string;
    level: number;
    subclass?: string;
  }[];
  userId?: string;
  
  // Параметры для создания персонажа
  abilityPointsUsed?: number;
  
  // Персональные данные
  personalityTraits?: string;
  ideals?: string;
  bonds?: string;
  flaws?: string;
  appearance?: string;
  backstory?: string;
  
  // Поля для обратной совместимости
  hitPoints?: {
    maximum: number;
    current: number;
    temporary: number;
  };
  
  [key: string]: any; // Для поддержки дополнительных полей
}

// Define Character Spell interface
export interface CharacterSpell {
  id?: string;
  name: string;
  level: number;
  school?: string;
  castingTime?: string;
  range?: string;
  components?: string;
  duration?: string;
  description?: string | string[];
  classes?: string[] | string;
  prepared?: boolean;
  ritual?: boolean;
  concentration?: boolean;
  verbal?: boolean;
  somatic?: boolean;
  material?: boolean;
  materials?: string;
}

// Define Feature interface
export interface Feature {
  id?: string;
  name: string;
  source?: string;
  description: string;
  level?: number;
  active?: boolean;
  uses?: {
    max: number;
    current: number;
    recharge: 'short' | 'long' | 'daily' | 'other';
  };
}

// Define AbilityScores interface
export interface AbilityScores {
  strength?: number;
  dexterity?: number;
  constitution?: number;
  intelligence?: number;
  wisdom?: number;
  charisma?: number;
  STR?: number; // Короткие имена для совместимости
  DEX?: number;
  CON?: number;
  INT?: number;
  WIS?: number;
  CHA?: number;
  [key: string]: number | undefined;
}

// Define Item interface for equipment
export interface Item {
  id?: string;
  name: string;
  type?: string;
  description?: string;
  weight?: number;
  cost?: number;
  equipped?: boolean;
  quantity?: number;
}

// Define HitPointEvent interface for damage logs
export interface HitPointEvent {
  id: string;
  type: 'damage' | 'healing' | 'heal' | 'tempHP' | 'temp' | 'death-save';
  amount: number;
  source: string;
  timestamp: number | Date;
}
