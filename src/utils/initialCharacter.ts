
import { Character } from '@/types/character';

export const createInitialCharacter = (): Character => {
  return {
    name: '',
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
    maxHp: 0,
    currentHp: 0,
    tempHp: 0,
    temporaryHp: 0,
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
    hitDice: {
      total: 1,
      value: 'd8', // строка вместо числа
      used: 0,
      dieType: 'd8'
    },
    money: {
      cp: 0,
      sp: 0,
      ep: 0,
      gp: 10,
      pp: 0
    },
    deathSaves: {
      successes: 0,
      failures: 0
    },
    gender: '',
    personalityTraits: '',
    ideals: '',
    bonds: '',
    flaws: '',
    backstory: '',
    initiative: 0,
    spellSlots: {},
    resources: {},
    sorceryPoints: {
      current: 0,
      max: 0
    },
    lastDiceRoll: {
      diceType: 'd20',
      count: 1,
      modifier: 0,
      rolls: [0],
      total: 0,
      label: '',
      timestamp: ''
    },
    notes: '',
    hp: {
      current: 0,
      max: 0,
      temp: 0
    },
    spellcasting: null,
    savingThrows: {
      strength: false,
      dexterity: false,
      constitution: false,
      intelligence: false,
      wisdom: false,
      charisma: false
    },
    skills: {},
    updatedAt: new Date().toISOString(),
    gold: 0,
    experience: 0,
    languages: [],
    image: '',
    skillBonuses: {},
    currency: {
      cp: 0,
      sp: 0,
      ep: 0,
      gp: 0,
      pp: 0
    }
  };
};
