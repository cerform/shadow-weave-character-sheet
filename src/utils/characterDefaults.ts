import { Character } from "@/types/character";

// Создает дефолтный объект персонажа для использования в разных местах приложения
export const createDefaultCharacter = (): Character => {
  return {
    name: "",
    level: 1,
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
      charisma: 10,
    },
    stats: {
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10,
    },
    skills: {},
    hitPoints: {
      current: 10,
      maximum: 10,
      temporary: 0,
    },
    currentHp: 10,
    maxHp: 10,
    tempHp: 0,
    armorClass: 10,
    speed: 30,
    proficiencyBonus: 2,
    deathSaves: { successes: 0, failures: 0 },
    inspiration: false,
    equipment: [],
    features: [],
    spells: [],
    spellSlots: {},
    money: { gp: 0 },
    gold: 0,
    resources: {},
    languages: [],
  };
};
