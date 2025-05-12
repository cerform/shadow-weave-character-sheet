
// Функция для расчета модификатора характеристики
export const calculateModifier = (abilityScore: number = 10): number => {
  return Math.floor((abilityScore - 10) / 2);
};

// Альтернативные имена для совместимости с различными частями приложения
export const getModifierFromAbilityScore = calculateModifier;
export const getNumericModifier = calculateModifier;
export const getAbilityModifierValue = calculateModifier;

// Функция для получения строки модификатора с + или -
export const getModifierString = (modifier: number): string => {
  return modifier >= 0 ? `+${modifier}` : `${modifier}`;
};

// Альтернативные имена для совместимости
export const getAbilityModifier = (abilityScore: number): string => {
  return getModifierString(calculateModifier(abilityScore));
};

export const getAbilityModifierString = getAbilityModifier;
export const formatModifier = getModifierString;

// Функция для расчета бонуса мастерства
export const calculateProficiencyBonus = (level: number): number => {
  return Math.floor((level - 1) / 4) + 2;
};

// Функция для создания пустого персонажа
export const createDefaultCharacter = (): any => {
  return {
    name: '',
    race: '',
    class: '',
    level: 1,
    background: '',
    alignment: '',
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
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10, 
    charisma: 10,
    maxHp: 0,
    currentHp: 0,
    armorClass: 10,
    proficiencyBonus: 2,
    speed: 30,
    equipment: [],
    features: [],
    spells: [],
    proficiencies: {
      languages: [],
      tools: [],
      weapons: [],
      armor: [],
      skills: []
    },
    money: {
      cp: 0,
      sp: 0,
      ep: 0,
      gp: 0,
      pp: 0
    },
    deathSaves: {
      successes: 0,
      failures: 0
    },
    savingThrowProficiencies: {}, // Добавляем для совместимости
    skillProficiencies: {}, // Добавляем для совместимости
    expertise: [], // Добавляем для совместимости
    raceFeatures: [], // Добавляем для совместимости
    classFeatures: [], // Добавляем для совместимости
    backgroundFeatures: [], // Добавляем для совместимости
    feats: [], // Добавляем для совместимости
    skillBonuses: {} // Добавляем для совместимости
  };
};
