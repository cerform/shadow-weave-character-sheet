
declare module '@/types/character' {
  export interface CharacterSheet {
    id: string;
    name: string;
    level: number;
    race?: string;
    subrace?: string;
    class?: string;
    className?: string;
    subclass?: string;
    background?: string;
    alignment?: string;
    abilities: AbilityScores;
    hitPoints: HitPoints;
    hitDice: {
      total: number;
      current: number;
      value?: string;
      used?: number;
    };
    proficiencies?: Proficiencies;
    equipment?: Equipment[];
    features?: Feature[];
    spells?: (string | CharacterSpell)[];
    personalityTraits?: string[];
    ideals?: string[];
    bonds?: string[];
    flaws?: string[];
    backstory?: string;
    userId?: string;
    // Дополнительные поля
    experience?: number;
    proficiencyBonus?: number;
    inspiration?: boolean;
    armorClass?: number;
    initiative?: number;
    speed?: number;
    maxHitPoints?: number;
    temporaryHitPoints?: number;
    deathSaves?: {
      successes: number;
      failures: number;
    };
    savingThrows?: SaveProficiencies;
    skills?: SkillProficiencies;
    passivePerception?: number;
    languages?: string[];
    conditions?: string[];
    resources?: Resource[];
    notes?: string;
    coins?: {
      copper?: number;
      silver?: number;
      electrum?: number;
      gold?: number;
      platinum?: number;
    };
    // Дополнительные данные для рас
    size?: string;
    speed?: number;
    age?: number;
    // Характеристики для заклинателей
    spellcastingAbility?: 'intelligence' | 'wisdom' | 'charisma';
    spellSaveDC?: number;
    spellAttackBonus?: number;
    spellSlots?: SpellSlots;
    spellsKnown?: number; // для колдунов и чародеев
    // Для отслеживания мультиклассирования
    classes?: { class: string, level: number }[];
  }

  export type AbilityScores = {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
    STR?: number;
    DEX?: number;
    CON?: number;
    INT?: number;
    WIS?: number;
    CHA?: number;
  };

  export interface HitPoints {
    current: number;
    max: number;
    temporary: number;
  }

  export interface Proficiencies {
    weapons?: string[];
    armor?: string[];
    tools?: string[];
    languages?: string[];
  }

  export interface Equipment {
    name: string;
    quantity: number;
    weight?: number;
    value?: number;
    description?: string;
    equipped?: boolean;
  }

  export interface Feature {
    name: string;
    source: string;
    description: string;
    level?: number;
  }

  export interface CharacterSpell {
    name: string;
    level: number;
    school?: string;
    castingTime?: string;
    range?: string;
    components?: string;
    verbal?: boolean;
    somatic?: boolean;
    material?: boolean;
    materialComponents?: string;
    duration?: string;
    description?: string;
    classes?: string[] | string;
    prepared: boolean;
    concentration?: boolean;
    ritual?: boolean;
    higherLevels?: string;
    higherLevel?: string;
  }

  export interface SpellData {
    id?: string | number;
    name: string;
    level: number;
    school?: string;
    castingTime?: string;
    range?: string;
    components?: string;
    verbal?: boolean;
    somatic?: boolean;
    material?: boolean;
    materialComponents?: string;
    description?: string;
    higherLevels?: string;
    higherLevel?: string; // Альтернативное имя в некоторых структурах данных
    classes?: string[] | string;
    prepared?: boolean;
    concentration?: boolean;
    ritual?: boolean;
    duration?: string;
    [key: string]: any; // Индексная сигнатура для совместимости
  }

  export interface SaveProficiencies {
    strength?: boolean;
    dexterity?: boolean;
    constitution?: boolean;
    intelligence?: boolean;
    wisdom?: boolean;
    charisma?: boolean;
  }

  export interface SkillProficiencies {
    acrobatics?: boolean;
    animalHandling?: boolean;
    arcana?: boolean;
    athletics?: boolean;
    deception?: boolean;
    history?: boolean;
    insight?: boolean;
    intimidation?: boolean;
    investigation?: boolean;
    medicine?: boolean;
    nature?: boolean;
    perception?: boolean;
    performance?: boolean;
    persuasion?: boolean;
    religion?: boolean;
    sleightOfHand?: boolean;
    stealth?: boolean;
    survival?: boolean;
  }

  export interface Resource {
    name: string;
    max: number;
    current: number;
    shortRest?: boolean;
    longRest?: boolean;
  }

  export interface SpellSlots {
    1: { max: number; current: number };
    2: { max: number; current: number };
    3: { max: number; current: number };
    4: { max: number; current: number };
    5: { max: number; current: number };
    6: { max: number; current: number };
    7: { max: number; current: number };
    8: { max: number; current: number };
    9: { max: number; current: number };
  }

  export interface Character extends CharacterSheet {
    features: Feature[];
  }

  export interface ClassRequirement {
    abilityRequirements: {
      strength?: number;
      dexterity?: number;
      constitution?: number;
      intelligence?: number;
      wisdom?: number;
      charisma?: number;
    };
    description: string;
  }

  export interface Background {
    name: string;
    description: string;
    skillProficiencies: string[];
    toolProficiencies?: string[];
    languages?: string[];
    equipment: string[];
    feature: {
      name: string;
      description: string;
    };
    personalityTraits: string[];
    ideals: string[];
    bonds: string[];
    flaws: string[];
    suggestedCharacteristics?: string;
  }

  export interface ClassFeatures {
    [level: string]: {
      features: {
        name: string;
        description: string;
      }[];
      spellsKnown?: number;
      cantripsKnown?: number;
      spellSlots?: {
        1?: number;
        2?: number;
        3?: number;
        4?: number;
        5?: number;
        6?: number;
        7?: number;
        8?: number;
        9?: number;
      };
    };
  }

  export interface HitPointEvent {
    type: 'damage' | 'healing' | 'temp';
    amount: number;
    source?: string;
    timestamp: number;
  }

  export const ABILITY_SCORE_CAPS = {
    DEFAULT: 10,
    BASE_CAP: 15,
    RACIAL_CAP: 17,
    ASI_CAP: 20,
    MAGIC_CAP: 30,
    MIN: 1
  };
}
