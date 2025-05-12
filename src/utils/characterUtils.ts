
/**
 * Вычисляет модификатор характеристики по её значению
 * @param abilityScore значение характеристики
 * @returns модификатор характеристики
 */
export const calculateModifier = (abilityScore: number): number => {
  return Math.floor((abilityScore - 10) / 2);
};

/**
 * Возвращает строковое представление модификатора характеристики со знаком
 * @param abilityScore значение характеристики
 * @returns строковое представление модификатора (например "+3" или "-1")
 */
export const getAbilityModifierString = (abilityScore: number | undefined): string => {
  if (abilityScore === undefined) return '';
  const modifier = calculateModifier(abilityScore);
  return modifier >= 0 ? `+${modifier}` : `${modifier}`;
};

/**
 * Создаёт персонажа по умолчанию
 * @returns новый объект персонажа с базовыми значениями
 */
export const createDefaultCharacter = (): Character => {
  const currentDate = new Date().toISOString();
  
  return {
    id: `temp-${Date.now()}`,
    name: 'Новый персонаж',
    class: '',
    level: 1,
    race: '',
    background: '',
    alignment: 'Нейтральный',
    abilities: {
      STR: 10,
      DEX: 10,
      CON: 10,
      INT: 10,
      WIS: 10,
      CHA: 10,
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10
    },
    stats: {
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10
    },
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10,
    proficiencies: {
      languages: [],
      tools: [],
      weapons: [],
      armor: [],
      skills: []
    },
    equipment: [],
    gold: 0,
    hp: {
      current: 10,
      max: 10,
      temp: 0
    },
    currentHp: 10,
    maxHp: 10,
    tempHp: 0,
    spellcasting: null,
    spells: [],
    features: [],
    proficiencyBonus: 2,
    armorClass: 10,
    initiative: 0,
    speed: 30,
    hitDice: {
      total: 1,
      value: 'd8',
      used: 0,
      dieType: 'd8'
    },
    savingThrows: {
      strength: false,
      dexterity: false,
      constitution: false,
      intelligence: false,
      wisdom: false,
      charisma: false
    },
    skills: {},
    personalityTraits: '',
    ideals: '',
    bonds: '',
    flaws: '',
    backstory: '',
    updatedAt: currentDate,
    createdAt: currentDate,
    // Дополнительные поля для совместимости
    resources: {},
    spellSlots: {},
    expertise: [],
    raceFeatures: [],
    classFeatures: [],
    backgroundFeatures: [],
    feats: [],
    money: {
      cp: 0,
      sp: 0,
      ep: 0,
      gp: 0,
      pp: 0
    },
    currency: {
      cp: 0,
      sp: 0,
      ep: 0,
      gp: 0,
      pp: 0
    },
    appearance: '',
    sorceryPoints: {
      current: 0,
      max: 0
    },
    notes: '',
    lastDiceRoll: {
      diceType: 'd20',
      count: 1,
      modifier: 0,
      rolls: [0],
      total: 0,
      label: '',
      timestamp: currentDate
    }
  };
};

/**
 * Получает числовой модификатор для характеристики
 */
export const getNumericModifier = (abilityScore: number): number => {
  return Math.floor((abilityScore - 10) / 2);
};

/**
 * Обновляет бонус мастерства в зависимости от уровня персонажа
 */
export const updateCharacterProficiencyBonus = (character: Character): Partial<Character> => {
  const level = character.level || 1;
  const proficiencyBonus = 1 + Math.ceil(level / 4);
  return { proficiencyBonus };
};

/**
 * Возвращает полное название характеристики
 */
export const getAbilityNameFull = (shortName: string): string => {
  const abilityNames: Record<string, string> = {
    'STR': 'Сила',
    'DEX': 'Ловкость',
    'CON': 'Телосложение',
    'INT': 'Интеллект',
    'WIS': 'Мудрость',
    'CHA': 'Харизма',
    'strength': 'Сила',
    'dexterity': 'Ловкость',
    'constitution': 'Телосложение',
    'intelligence': 'Интеллект',
    'wisdom': 'Мудрость',
    'charisma': 'Харизма'
  };

  return abilityNames[shortName] || shortName;
};

// Adding helper functions for character creation
export const getModifierFromAbilityScore = calculateModifier;

import { Character } from '@/types/character';
