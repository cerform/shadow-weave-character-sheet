
import { Character } from '@/types/character';

export const createDefaultCharacter = (): Character => {
  return {
    name: '',
    race: '',
    class: '',
    level: 1,
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10,
    stats: {
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10,
    },
    hitPoints: {
      current: 8,
      maximum: 8,
      temporary: 0,
    },
    maxHp: 8,
    currentHp: 8,
    armorClass: 10,
    speed: 30,
    proficiencyBonus: 2,
    equipment: [],
    spells: [],
    money: {
      gp: 0,
      sp: 0,
      cp: 0,
    },
  };
};
