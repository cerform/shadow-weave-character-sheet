// Функция для расчета модификатора характеристики
export const calculateModifier = (abilityScore: number = 10): number => {
  return Math.floor((abilityScore - 10) / 2);
};

// Функция для получения строки модификатора с + или -
export const getModifierString = (modifier: number): string => {
  return modifier >= 0 ? `+${modifier}` : `${modifier}`;
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
    }
  };
};
