
import { Character } from '@/types/character';

export const calculateAbilityModifier = (abilityScore: number): number => {
  return Math.floor((abilityScore - 10) / 2);
};

export const getAbilityModifier = (score: number): string => {
  const mod = calculateAbilityModifier(score);
  return mod >= 0 ? `+${mod}` : `${mod}`;
};

export const getNumericModifier = (score: number): number => {
  return calculateAbilityModifier(score);
};

export const calculateProficiencyBonus = (level: number): number => {
  return Math.floor((level - 1) / 4) + 2;
};

export const createDefaultCharacter = (): Character => {
  return {
    id: '',
    userId: '',
    name: 'Новый персонаж',
    race: 'Человек',
    class: 'Воин',
    level: 1,
    background: '',
    alignment: 'Нейтральный',
    experience: 0,
    abilities: {
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10,
      // Добавляем алиасы для обратной совместимости
      STR: 10,
      DEX: 10,
      CON: 10,
      INT: 10,
      WIS: 10,
      CHA: 10
    },
    proficiencyBonus: 2,
    armorClass: 10,
    maxHp: 10,
    currentHp: 10,
    temporaryHp: 0,
    hitDice: {
      total: 1,
      used: 0,
      type: 'd8',
      dieType: 'd8',
    },
    deathSaves: {
      successes: 0,
      failures: 0,
    },
    inspiration: false,
    conditions: [],
    inventory: [],
    equipment: [],
    spells: [],
    proficiencies: [],
    features: [],
    notes: '',
    resources: {},
    savingThrowProficiencies: [],
    skillProficiencies: [],
    expertise: [],
    skillBonuses: {},
    spellcasting: {
      ability: 'intelligence',
      saveDC: 0,
      attackBonus: 0,
    },
    gold: 0,
    initiative: 0,
    lastDiceRoll: {
      formula: '',
      rolls: [],
      total: 0,
    },
    languages: [],
  };
};
